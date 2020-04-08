const DB = require('../dbConnect')
const users = require('../index.js')

const search = async (req, res) => {
  try {
    console.log('search', req.body)
    const results = await DB.getAxes(req.body)
    res.send(results)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

const viewAxe = async (req, res) => {
  try {
    console.log('search', req.body)
    const { axeID } = req.body
    const result = await DB.getAxe(axeID)
    // let axe = Samples.filter( s => s.id === req.body.axeID)
    res.send(result)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

const trade = async (req, res) => {
  try {
    console.log('Trade', req.body)
    const { userID, axeID } = req.body.data
    const { firstName, lastName, company } = await DB.getUser(userID)
    const {name} = await DB.getCompany(company)
    // console.log('888877', firstName, lastName, company, axeID, CCC)
    req.body.socketID &&
      req.app.io
        .to(req.body.socketID)
        .emit('TradeRequest', { firstName, lastName, company: name, axeID })
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = { search, viewAxe, trade }
