const DB = require('../dbConnect')

const submitAxe = async (req, res, next) => {
  const result = await DB.addAxe(req.body.axe).catch(next)
  return res.sendStatus(result)
}

const updateAxe = async (req, res, next) => {
  const { axe, userID } = req.body
  const update = await DB.updateAxe(axe, userID).catch(next)
  if (update === 'success') res.sendStatus(200)
}

module.exports = {
  submitAxe,
  updateAxe,
}
