const jwt = require('jsonwebtoken')
const DB = require('../dbConnect')

const createAccount = async (req, res) => {
  console.log('UUUSSSEEERRRR', req.body);
  try {
    const create = req.body.label === 'add' ? await DB.createAccount(req.body.user) : await DB.updateUser(req.body.user)
    res.sendStatus(create)
  } catch (error) {
    console.log('CREAT ACCOUNT ERROR', error)
    res.sendStatus(500)
  }
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

const customList = async (req, res) => {
  try {
    const newList = await DB.addCustomList(req.body)
    res.send(newList)
  } catch (error) {
    res.sendStatus(500)
  }
}

const deleteCustomList = async (req, res) => {
  try {
    const newList = await DB.deleteCustomList(req.body)
    res.send(newList)
  } catch (error) {
    res.sendStatus(500)
  }
}

const savePreferences = async (req, res) => {
  try {
    console.log('Save Preferences', req.body)
    const newPreferences = await DB.savePreferences(req.body)
    res.send(newPreferences)
  } catch (error) {
    res.sendStatus(500)
  }
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
