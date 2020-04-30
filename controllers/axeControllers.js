const WebSocket = require('ws')
const DB = require('../dbConnect')

const submitAxe = async (req, res) => {
  try {
    console.log('Submit Axe', req.body)
    const result = await DB.addAxe(req.body.axe)
    res.sendStatus(result)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

const updateAxe = async (req, res) => {
  try {
    console.log('Update Axe', req.body)
    const update = await DB.updateAxe(req.body.axe)
    if (update === 'success') res.sendStatus(200)

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  submitAxe,
  updateAxe
}
