const DB = require('../dbConnect')
const Email = require('../nodemailer')

// What information do we want to capture / alerts do we want to send?
// WHat happens if the trade is cancelled?

// Initial trade request (client to bank).
// Checks that there is sufficient capacity remaining and that axe isn't currently being traded
// Pushes the details of the client to the bank
const RFQ = async (req, res) => {
  try {
    console.log('Trade', req.body)
    const { userID, axeID, amount } = req.body.data1
    const { activeTraders } = req.body
    const { capacity, remaining } = await DB.checkCapacity(axeID, amount)

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
    activeTraders.forEach( t =>
      req.app.io.to(t.socketID).emit('TradeRequest', {
        axe,
        tradeDetails
      })
    )
    res.send({ status: 'requesting' })
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

// Cancel trade - either client or bank cancels
const pickup = async (data, users) => {
  try {
    console.log('pickup', data, users);
    let {clientTrader} = await DB.getTransaction(data.transactionID)
    await DB.updateTransaction(data.transactionID, {
      pickupTime: new Date(),
      bankTrader: data.userID,
    })
    const targetSocket = users.filter( u => u.userID === clientTrader)
    console.log('TARGET SOCKET', clientTrader, targetSocket);
    return targetSocket[0].socketID
  } catch (error) {
    console.log('ERROR', error)
  }
}


// Cancel trade - either client or bank cancels
const sendPrice = async (data) => {
  try {
    console.log('Send Price', data)
    console.log('UUUU', users);
    DB.updateTransaction(data.transactionID, {
      pricingVolChange: data.pricingVol,
      pricingVolChangeDate: new Date()
    })
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
const confirmPickup = async (req, res) => {
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
  RFQ,
  pickup,
  sendPrice,
  cancelTrade,
  confirmPickup,
  editTrade,
  finaliseTrade,
  fullDetails,
}
