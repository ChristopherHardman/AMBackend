const DB = require('../dbConnect')
const Email = require('../nodemailer')


// What information do we want to capture / alerts do we want to send?
// WHat happens if the trade is cancelled?

// Initial trade request (client to bank).
// Pushes the details of the client to the bank
const trade = async (req, res) => {
  try {
    console.log('Trade', req.body)
    const { userID, axeID } = req.body.data
    const { firstName, lastName, company } = await DB.getUser(userID)
    const {name} = await DB.getCompany(company)
    req.body.socketID &&
      req.app.io
        .to(req.body.socketID)
        .emit('TradeRequest', { firstName, lastName, company: name, axeID })
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

    Email.confirmTrade()
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
  finaliseTrade
 }
