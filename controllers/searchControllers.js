const DB = require('../dbConnect')

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
    res.send(result)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = { search, viewAxe }
