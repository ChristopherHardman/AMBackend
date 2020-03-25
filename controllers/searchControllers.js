const DB = require('../dbConnect')
const users = require('../index.js')

const search = async (req, res) => {
  try {
    console.log('search', req.body)
    const results = await DB.getAxes(req.body.query)
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
    console.log(firstName, lastName, company, axeID)
    req.body.socketID &&
      req.app.io
        .to(req.body.socketID)
        .emit('FromAPI', { firstName, lastName, company, axeID })
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = { search, viewAxe, trade }
