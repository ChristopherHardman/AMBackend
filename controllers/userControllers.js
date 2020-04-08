const jwt = require('jsonwebtoken')
const DB = require('../dbConnect')

const createAccount = async (req, res) => {
  try {
    console.log('Create Account', req.body)
    const create = DB.createAccount(req.body)
    res.sendStatus(200)
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
      user.clients = await DB.getCompanies()
      res.send(user)
    }
  } catch (error) {
    console.log('SIGNIN ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  createAccount,
  signIn,
}
