const DB = require('../dbConnect')
const Email = require('../nodemailer')


// Initial trade request (client to bank).
// Checks that there is sufficient capacity remaining and that axe isn't currently being traded
// Then sends alert to the axe creator (if online) - if not online or doesn't pick-up within 10 seconds,
// the request is sent to all other traders at the relevant bank
const RFQ = async (req, res) => {
  try {

    console.log('RFQ');
    const { userID, axeID, amount } = req.body.data1

    const { company } = await DB.getUser(userID)
    const { type } = await DB.getCompany(company)
    const axe = await DB.getAxeByID(axeID)

    // Create a new transaction
    const newTransaction = {
      bankCompany: axe.company,
      clientCompany: company,
      clientTrader: userID,
      axeID,
      initialAmount: amount,
      initialRequestTime: new Date()
    }
    const transactionID = await DB.createTransaction(newTransaction)

    // Check remaining capacity
    if (axe.capacity < amount) {
      res.send({ status: 'no capacity', remaining: axe.capacity })
      return
    }

    // Check if axe is currently being traded or paused
    // const status = await DB.checkTradeStatus(axeID)
    if (axe.status !== 'active') {
      res.send({ status: 'engaged' })
      return
    }

    // Check if anyone from the bank is online
    const companyRoom = await new Promise((resolve, reject) => {
      req.app.io.in(axe.company).clients((err, clients) => {
        console.log('ROOM Length', clients.length);
        if (err) reject(err)
        resolve(clients.length)
      })
    })
    if (companyRoom === 0) {
      res.send({ status: 'no trader' })
      return
    }

    const tradeDetails = { transactionID, type, amount }

    await DB.updateTradeStatus(axeID, 'requesting')

    // Check is trader linked to axe is online - if so, alert them first and
    // give them 10 seconds to respond. If not online or hasn't picked-up after 10
    // seconds, other members of the bank
    const createrRoom = await new Promise((resolve, reject) => {
      req.app.io.in(axe.userID).clients((err, clients) => {
        if (err) reject(err)
        resolve(clients.length)
      })
    })
    if (createrRoom !== 0) {
      req.app.io.to(axe.userID).emit('TradeRequest', {
        axe,
        tradeDetails
      })

      setTimeout(async () => {
        const axe = await DB.getAxeByID(axeID)
        console.log('STATUS ***', axe);
        if (axe.status === 'requesting') {
          req.app.io.to(axe.company).emit('TradeRequest', {
            axe,
            tradeDetails
          })
        }
      }, 10000)
  }

    if (createrRoom === 0) {
      req.app.io.to(axe.company).emit('TradeRequest', {
        axe,
        tradeDetails
      })
    }
    res.send({ status: 'requesting', transactionID })
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

// Someone from the bank picksup RFQ
// Record pickup, update status of the axe and inform client
const pickup = async (data, io) => {
  try {
    console.log('pickup', data)
    const { clientTrader, axeID } = await DB.getTransaction(data.transactionID)
    await DB.updateTransaction(data.transactionID, {
      pickupTime: new Date(),
      bankTrader: data.userID,
    })
    await DB.updateTradeStatus(axeID, 'pickedUp')
    io.to(clientTrader).emit('Pickup', data.transactionID)
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Someone from the bank declines RFQ
// To do - manage the situation where axe is declined by all bank traders
const decline = async (data) => {
  try {
    console.log('Decline', data);
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Bank sends price to client
const sendPrice = async (data, io) => {
  try {
    console.log('Send Price', data)
    // TO DO: update axe details
    const { clientTrader, axeID, bankTrader } = await DB.getTransaction(data.transactionID)
    DB.updateTransaction(data.transactionID, {
      pricingVolChange: data.pricingVol,
      pricingVolChangeDate: new Date()
    })
    // const axeUpdate = {id: axeID}
    // let potentialUpdates = [
    //   'pricingVol',
    //   'pricingVol1',
    //   'pricingVol2',
    //   'putPricingVol',
    //   'callPricingVol',
    //   'spotRef',
    //   'forwardRef',
    //   'NDFRef',
    //   'premium',
    //   'netPremium',
    //   potentialUpdates.forEach((l) => {
    //     if (data[l]) axeUpdate[l] = Number(data[l])
    //   })

      // if (data.pricingVol)  axeUpdate[l] = Number(data[l])
    // DB.updateAxe(axeUpdate, bankTrader, true)
    updateAxe(axeID, bankTrader, data)
    io.to(clientTrader).emit('SendPrice', data)
  } catch (error) {
    console.log('ERROR', error)
  }
}


const updateAxe = (axeID, bankTrader, data) => {
  const axeUpdate = {id: axeID}
  let potentialUpdates = [
    'pricingVol',
    'pricingVol1',
    'pricingVol2',
    'putPricingVol',
    'callPricingVol',
    'spotRef',
    'forwardRef',
    'NDFRef',
    'premium',
    'netPremium',
    ]
    potentialUpdates.forEach((l) => {
      if (data[l]) axeUpdate[l] = Number(data[l])
    })
    DB.updateAxe(axeUpdate, bankTrader, true)
}


const requestDelta = async (data, io) => {
  try {
    console.log('Request Delta', data);
    const { transactionID, deltaType } = data
    const { bankTrader } = await DB.getTransaction(transactionID)
    DB.updateTransaction(transactionID, {
      initialDelta: deltaType,
    })
    io.to(bankTrader).emit('RequestDelta', deltaType)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const accept = async (data, io) => {
  try {
    console.log('ACCEPT', data)
    const { clientTrader, bankTrader } = await DB.getTransaction(data.transactionID)
    const clientDetails = await DB.getUserAndCompany(clientTrader)
    const bankDetails = await DB.getUserAndCompany(bankTrader)
    io.to(bankTrader).emit('ClientDetails', clientDetails)
    io.to(clientTrader).emit('BankDetails', bankDetails)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const disagree = async (data, io) => {
  try {
    console.log('Disagree', data)
    const { clientTrader, bankTrader } = await DB.getTransaction(data.transactionID)
    const clientDetails = await DB.getUserAndCompany(clientTrader)
    io.to(bankTrader).emit('Disagree', clientDetails)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const acknowledgeToDeal = async (data, io) => {
  try {
    console.log('ACKNOWLEDGE TO DEAL', data)
    const { clientTrader, bankTrader } = await DB.getTransaction(data.transactionID)
    const clientDetails = await DB.getUserAndCompany(clientTrader)
    let bankDetails = await DB.getUserAndCompany(bankTrader)
    io.to(bankTrader).emit('ClientDetails', clientDetails)
    io.to(clientTrader).emit('AcknowledgeToDeal', bankDetails)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const sendFinalDetails = async (data, io) => {
  try {
    console.log('Send Final Details', data)
    const { clientTrader, bankTrader, axeID } = await DB.getTransaction(data.transactionID)
    io.to(clientTrader).emit('FinalDetails', data)
    const {ref} = await DB.getAxeByID(axeID)
    if (ref === 'Spot') data.forwardRef = null
    if (ref === 'Forward') data.spotRef = null
    updateAxe(axeID, bankTrader, data)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const clientAccept = async (data, io) => {
  try {
    console.log('Client Accept', data)
    io.emit('ClientAccept')
  } catch (error) {
    console.log('ERROR', error)
  }
}


const confirmResolved = async (data, io) => {
  try {
    console.log('Confirm Resolved', data)
    const { clientTrader } = await DB.getTransaction(data.transactionID)
    io.to(clientTrader).emit('ConfirmResolved')

  } catch (error) {
    console.log('ERROR', error)
  }
}

const finish = async (data, io) => {
  try {
    console.log('Finish!', data)
    const { initialAmount, axeID } = await DB.getTransaction(data.transactionID)
    DB.updateCapacity(axeID, initialAmount)
    await DB.updateTradeStatus(axeID, 'active')
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Client request times out for live trade
const timedOut = async (data, io) => {
  try {
    console.log('Timed out', data)
    const { clientTrader, axeID } = await DB.getTransaction(data.transactionID)
    io.to(clientTrader).emit('TimedOut')
    await DB.updateTradeStatus(axeID, 'active')
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Client requests to ref RFQ
const refRFQ = async (data, io) => {
  try {
    console.log('Ref RFQ', data)
    const { bankTrader } = await DB.getTransaction(data.transactionID)
    io.to(bankTrader).emit('RefRFQ', 'RefRFQ')
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Bank requests to ref Price
const refPrice = async (data, io) => {
  try {
    console.log('Ref Price', data)
    const { clientTrader } = await DB.getTransaction(data.transactionID)
    io.to(clientTrader).emit('RefPrice', 'RefPrice')
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Bank trader picks up trade request but then releases interval
// Inform client that trade has been released and resend trade request to all bank traders
const release = async (data, io) => {
  try {
    console.log('Release', data)
    const {
      clientTrader,
      clientCompany,
      axeID,
      initialAmount,
      bankCompany,
      id,
    } = await DB.getTransaction(data.transactionID)
    const { type } = await DB.getCompany(clientCompany)
    const axe = await DB.getAxeByID(axeID)
    const tradeDetails = { transactionID: id, type, amount: initialAmount }
    io.to(clientTrader).emit('Release')
    io.to(bankCompany).emit('TradeRequest', {
      axe,
      tradeDetails
    })
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Cancel trade - either client or bank cancels
const cancelTrade = async (data, io) => {
  try {
    console.log('Cancel Trade', data)
    const { transactionID, userID } = data
    DB.updateTransaction(transactionID, {
      cancelledBy: userID,
      cancelTime: new Date()
    })
    const { clientTrader, bankTrader, axeID } = await DB.getTransaction(data.transactionID)
    await DB.updateTradeStatus(axeID, 'active')
    io.to(clientTrader).to(bankTrader).emit('Cancel')
  } catch (error) {
    console.log('ERROR', error)
  }
}

module.exports = {
  accept,
  acknowledgeToDeal,
  confirmResolved,
  disagree,
  finish,
  RFQ,
  pickup,
  decline,
  sendPrice,
  cancelTrade,
  timedOut,
  release,
  clientAccept,
  requestDelta,
  sendFinalDetails,
  refRFQ,
  refPrice,
}
