const DB = require('../dbConnect')
const Email = require('../nodemailer')


// Initial trade request (client to bank).
// Checks that there is sufficient capacity remaining and that axe isn't currently being traded
// Then sends alert to the axe creator (if online) - if not online or doesn't pick-up within 10 seconds,
// the request is sent to all other traders at the relevant bank
const RFQ = async (req, res) => {
  try {
    const { userID, axeID, amount } = req.body.data1
    const { activeTraders } = req.body
    const { capacity, remaining } = await DB.checkCapacity(axeID, amount)

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
    if (!capacity) {
      res.send({ status: 'no capacity', remaining })
      return
    }

    // Check if axe is currently being traded
    // const status = await DB.checkTradeStatus(axeID)
    // if (status !== 'available') {
    //   res.send({ status: 'engaged' })
    //   return
    // }

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

    // await DB.updateTradeStatus(axeID, 'requesting')

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
      console.log('CREATOR', axe.userID);
      req.app.io.to(axe.userID).emit('TradeRequest', {
        axe,
        tradeDetails
      })

      setTimeout(async () => {
        const status = await DB.checkTradeStatus(axeID)
        if (status === 'available') {
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
const pickup = async (data, users, io) => {
  try {
    console.log('pickup', data, users);
    let { clientTrader, axeID } = await DB.getTransaction(data.transactionID)
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

// Bank sends price to client
const sendPrice = async (data, io) => {
  try {
    console.log('Send Price', data)
    // TO DO: update axe details
    const { clientTrader } = await DB.getTransaction(data.transactionID)
    DB.updateTransaction(data.transactionID, {
      pricingVolChange: data.pricingVol,
      pricingVolChangeDate: new Date()
    })
    io.to(clientTrader).emit('SendPrice', data)
  } catch (error) {
    console.log('ERROR', error)
  }
}


const requestDelta = async (data, io) => {
  try {
    const { transactionID, delta } = data
    const { bankTrader } = await DB.getTransaction(transactionID)
    DB.updateTransaction(transactionID, {
      initialDelta: delta,
    })
    io.to(bankTrader).emit('RequestDelta', delta)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const accept = async (data, io) => {
  try {
    console.log('ACCEPT', data);
    let {clientTrader, bankTrader} = await DB.getTransaction(data.transaction)
    let dataToSend = await DB.getUserAndCompany(clientTrader)
    io.to(bankTrader).emit('ClientDetails', dataToSend)
  } catch (error) {
    console.log('ERROR', error)
  }
}


const sendDelta = async (data, io) => {
  try {
    console.log('Send Delta', data)
    let {clientTrader, bankTrader} = await DB.getTransaction(data.transaction)
    let bankDetails = await DB.getUserAndCompany(bankTrader)
    const dataToSend = { bankDetails, deltaUpdate: data.deltaUpdate}
    io.to(clientTrader).emit('SendDelta', dataToSend)
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


// Client request times out for live trade
const timedOut = async (data, io) => {
  try {
    console.log('Timed out', data)
    const { clientTrader } = await DB.getTransaction(data.transactionID)
    io.to(clientTrader).emit('TimedOut')
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
    const { clientTrader, bankTrader } = await DB.getTransaction(data.transactionID)
    io.to(clientTrader).to(bankTrader).emit('Cancel')
  } catch (error) {
    console.log('ERROR', error)
  }
}

module.exports = {
  accept,
  RFQ,
  pickup,
  decline,
  sendPrice,
  cancelTrade,
  timedOut,
  release,
  clientAccept,
  requestDelta,
  sendDelta,
  refRFQ,
  refPrice,
}
