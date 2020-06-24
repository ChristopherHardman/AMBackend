const DB = require('../dbConnect')

const search = async (req, res, next) => {
  const results = await DB.getAxes(req.body).catch(next)
  return res.send(results)
}

const viewAxe = async (req, res, next) => {
  const { userID, axeID } = req.body
  const result = await DB.getAxe(userID, axeID).catch(next)
  return res.send(result)
}

module.exports = { search, viewAxe }
