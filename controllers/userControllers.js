const jwt = require('jsonwebtoken')
const DB = require('../dbConnect')

const createAccount = async (req, res, next) => {
  const create =
    req.body.label === 'add'
      ? await DB.createAccount(req.body.user).catch(next)
      : await DB.updateUser(req.body.user).catch(next)
  return res.sendStatus(create)
}

const signIn = async (req, res) => {
  try {
    const user = await DB.login(req.body)
    if (user === 'User not recognised') res.sendStatus(404)
    if (user === 'Incorrect password') res.sendStatus(403)
    if (user.email) {
      user.token = jwt.sign(
        {
          data: user.id,
        },
        'AM2020',
        { expiresIn: 60 * 60 }
      )
      res.send(user)
    }
  } catch (error) {
    console.log('SIGNIN ERROR', error)
    res.sendStatus(500)
  }
}

const customList = async (req, res, next) => {
  const newList = await DB.addCustomList(req.body).catch(next)
  return res.send(newList)
}

const deleteCustomList = async (req, res, next) => {
  const newList = await DB.deleteCustomList(req.body).catch(next)
  return res.send(newList)
}

const savePreferences = async (req, res, next) => {
  const newPreferences = await DB.savePreferences(req.body).catch(next)
  return res.send(newPreferences)
}

const createAlert = async (req, res) => {
  try {
    console.log('CREATE ALERT', req.body);
  } catch (error) {
    res.sendStatus(500)
  }
}

module.exports = {
  createAccount,
  createAlert,
  customList,
  deleteCustomList,
  savePreferences,
  signIn,
}
