const DB = require('../dbConnect')

const submitAxe = async (req, res, next) => {
  const result = await DB.addAxe(req.body.axe).catch(next)
  return res.sendStatus(200)
}

const updateAxe = async (req, res, next) => {
  const { axe, userID } = req.body
  const update = await DB.updateAxe(axe, userID).catch(next)
  return res.sendStatus(200)
}

const pauseAll = async (req, res, next) => {
  const { companyID, label } = req.body
  const update = await DB.pauseAll(companyID, label).catch(next)
  return res.send(update)
}

module.exports = {
  pauseAll,
  submitAxe,
  updateAxe,
}
