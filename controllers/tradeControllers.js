const DB = require('../dbConnect')
const Email = require('../nodemailer')


// Initial trade request (client to bank).
// Checks that there is sufficient capacity remaining and that axe isn't currently being traded
// Then sends alert to the axe creator (if online) - if not online or doesn't pick-up within 10 seconds,
// the request is sent to all other traders at the relevant bank
const RFQ = async (req, res) => {
  try {
    console.log('Trade', req.body)
    const { userID, axeID, amount } = req.body.data1
    const { activeTraders } = req.body
    const { capacity, remaining } = await DB.checkCapacity(axeID, amount)
    console.log('Active Traders', activeTraders);

    if (!capacity) {
      res.send({ status: 'no capacity', remaining })
      return
    }
    const status = await DB.checkTradeStatus(axeID)
    if (!status) {
      res.send({ status: 'engaged' })
      return
    }
    if (activeTraders.length === 0) {
      res.send({ status: 'no trader' })
      return
    }

    const { company } = await DB.getUser(userID)
    const { type } = await DB.getCompany(company)
    const axe = await DB.getAxeByID(axeID)

    const newTransaction = {
      clientTrader: userID,
      axeID,
      initialAmount: amount,
      initialRequestTime: new Date()
    }
    const transactionID = await DB.createTransaction(newTransaction)

    tradeDetails = { transactionID, type, amount }
    // await DB.updateTradeStatus(axeID, 'engaged')
    // req.body.socketID &&
    const isAxeCreatorAvailable = activeTraders.filter(
      (t) => t.userID === axe.trader
    )[0]
    console.log('Available?', isAxeCreatorAvailable)
    if (isAxeCreatorAvailable) {

    }

    if (!isAxeCreatorAvailable) {
      activeTraders.forEach( t =>
        req.app.io.to(t.socketID).emit('TradeRequest', {
          axe,
          tradeDetails
        })
      )
    }

    res.send({ status: 'requesting' })
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

// Someone from the bank picksup RFQ
const pickup = async (data, users, io) => {
  try {
    console.log('pickup', data, users);
    let {clientTrader} = await DB.getTransaction(data.transactionID)
    await DB.updateTransaction(data.transactionID, {
      pickupTime: new Date(),
      bankTrader: data.userID,
    })
    const targetSocket = users.filter( u => u.userID === clientTrader)
    // let a = Object.keys(io.sockets.connected)
    // let z = io.sockets.connected
    // a.forEach(k => io.to(k).emit('Pickup', k))
    io.emit('Pickup', 'Pickup')
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Someone from the bank declines RFQ
const decline = async (data) => {
  try {
    console.log('DDDD', data);
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Bank sends price to client
const sendPrice = async (data, io) => {
  try {
    console.log('Send Price', data)
    DB.updateTransaction(data.transactionID, {
      pricingVolChange: data.pricingVol,
      pricingVolChangeDate: new Date()
    })
    io.emit('sendPrice', data)
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Cancel trade - either client or bank cancels
const requestDelta = async (data, io) => {
  try {
    io.emit('requestDelta', data)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const accept = async (data, io) => {
  try {
    console.log('ACCEPT', data);
    // let {clientTrader} = await DB.getTransaction(data.transaction)
    // let dataToSend = await DB.getUserAndCompany(clientTrader)
    // console.log('DDDDD', dataToSend);
    // let transaction = await DB.getTransaction(data.transaction)
    let {clientTrader} = await DB.getTransaction(data.transaction)
    let dataToSend = await DB.getUserAndCompany(clientTrader)
    // io.emit('accept')
    io.emit('clientDetails', dataToSend)

    // io.emit('accept', dataToSend)
  } catch (error) {
    console.log('ERROR', error)
  }
}


const confirmDetails = async (data, io) => {
  try {
    console.log('Confirm Details', data);
    let {clientTrader} = await DB.getTransaction(data.transaction)
    let dataToSend = await DB.getUserAndCompany(clientTrader)
    io.emit('clientDetails', dataToSend)
  } catch (error) {
    console.log('ERROR', error)
  }
}


const release = async (data, io) => {
  try {
    console.log('Release')
    io.emit('release',)
  } catch (error) {
    console.log('ERROR', error)
  }
}

const sendDelta = async (data, io) => {
  try {
    console.log('Send Delta', data)
    let {bankTrader} = await DB.getTransaction(data.transaction)
    let dataToSend = await DB.getUserAndCompany(bankTrader)
    console.log('TTT', dataToSend);
    io.emit('sendDelta', dataToSend)
  } catch (error) {
    console.log('ERROR', error)
  }
}


const clientAccept = async (data, io) => {
  try {
    console.log('Client Accept')
    io.emit('clientAccept')
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Cancel trade - either client or bank cancels
const cancelTrade = async (req, res) => {
  try {
    console.log('Confirm Pickup', req.body)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}


// Lets the client know that the bank has picked-up Alert
const fullDetails = async (data) => {
  try {
    console.log('FFF DDD')

    req.app.io.emit('fullDetails', data)
  } catch (error) {
    console.log('ERROR', error)
  }
}

// Receive edit to axe from bank. Update the axe record and send to the client to confirm.
const editTrade = async (req, res) => {
  try {
    console.log('Confirm Pickup', req.body)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

// Confirms trade (either on initial request or if the edit is accepted)
// Sends email update to both parties and records the trade
// Updates the axe record - either changing it to trade or showing amount filled
const finaliseTrade = async (req, res) => {
  try {
    console.log('Finalise trade', req.body)
    Email.confirmTrade('chrisdelatopher@gmail.com')
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  accept,
  RFQ,
  pickup,
  decline,
  sendPrice,
  cancelTrade,
  editTrade,
  release,
  clientAccept,
  requestDelta,
  sendDelta,
  finaliseTrade,
  fullDetails,
}
