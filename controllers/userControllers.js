
const signIn = async (req, res) => {
  try {
    console.log('signin', req.body)
    const { email, password } = req.body;
    if (email === 'banktest@am.com' && password === 'am2020!') {
      res.send({ token: 'token', type: 'bank', firstName: 'Joe', lastName: 'Smith' })
    }
    if (email === 'clienttest@am.com' && password === 'am2020!') {
      res.send({ token: 'token', type: 'client', firstName: 'Joe', lastName: 'Smith' })
    }
    if (email !== 'clienttest@am.com' && email !== 'banktest@am.com' && password !== 'am2020!') {
      res.sendStatus(401)
    }

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {signIn};
