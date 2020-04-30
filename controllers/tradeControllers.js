const DB = require('../dbConnect')
const Email = require('../nodemailer')

// What information do we want to capture / alerts do we want to send?
// WHat happens if the trade is cancelled?

// Initial trade request (client to bank).
// Checks that there is sufficient capacity remaining and that axe isn't currently being traded
// Pushes the details of the client to the bank
const trade = async (req, res) => {
  try {
    console.log('Trade', req.body)
    const { userID, axeID, amount, delta } = req.body.data1
    const { capacity, remaining } = await DB.checkCapacity(axeID, amount)
    console.log('*******', capacity, remaining)
    if (!capacity) {
      console.log('not capacity')
      res.send({ status: 'no capacity', remaining })
      return
    }
    const status = await DB.checkTradeStatus(axeID)
    console.log('*******', status)
    if (!status) {
      res.send({ status: 'engaged' })
      return
    }
    const { firstName, lastName, company } = await DB.getUser(userID)
    const { name } = await DB.getCompany(company)
    req.body.socketID &&
      req.app.io.to(req.body.socketID).emit('TradeRequest', {
        firstName,
        lastName,
        company: name,
        axeID,
        amount,
        delta
      })
    // await DB.updateTradeStatus(axeID, 'engaged')
    res.send({ status: 'requesting' })
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
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

    Email.confirmTrade('info@axedmarkets.com')
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  trade,
  cancelTrade,
  confirmPickup,
  editTrade,
  finaliseTrade,
}
