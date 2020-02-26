const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const UserController = require('./controllers/UserController')
const port = 3001

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.post('/signin', UserController.signIn)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
