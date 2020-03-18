const DB = require('../dbConnect');
const jwt = require('jsonwebtoken');

const createAccount = async (req, res) => {
  try {
    console.log('Create Account', req.body)
    let create = DB.createAccount(req.body);
    res.sendStatus(200)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

const signIn = async (req, res) => {
  try {
    let user = await DB.login(req.body)
    user.token = 123
    user.token = jwt.sign({
      data: user.id
    }, 'AM2020', { expiresIn: 60 * 60 });
    res.send(user)
    // const { email, password } = req.body;
    // if (email === 'banktest@am.com' && password === 'am2020!') {
    //   res.send({ token: 'token', type: 'bank', firstName: 'Joe', lastName: 'Smith' })
    // }
    // if (email === 'clienttest@am.com' && password === 'am2020!') {
    //   res.send({ token: 'token', type: 'client', firstName: 'Joe', lastName: 'Smith' })
    // }
    // if (email !== 'clienttest@am.com' && email !== 'banktest@am.com' && password !== 'am2020!') {
    //   res.sendStatus(401)
    // }

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  createAccount,
  signIn
};
