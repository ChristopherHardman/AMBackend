const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const AdminController = require('./controllers/adminControllers')
const AxeController = require('./controllers/axeControllers')
const SearchController = require('./controllers/searchControllers')
const TradeController = require('./controllers/tradeControllers')
const UserController = require('./controllers/userControllers')

const port = process.env.PORT || 3001

let users = []

io.on('connection', (socket) => {
  socket.on('token', (data) => {
    users.push({ id: socket.id, userID: data })
  })
  socket.on('pickup', (data) => {
    io.emit('Pickup', 'Pickup')
  })
  socket.on('submitChanges', (data) => {
    console.log('Submit Changes', data)
    io.emit('submitChanges', data)
  })
  socket.on('tradeConfirmed', () => {
    io.emit('TradeConfirmed', 'TradeConfirmed')
  })
  socket.on('TradeConfirmedClient', () => {
    console.log('TCC')
    io.emit('TradeConfirmedClient')
  })
  socket.on('Cancel', () => {
    console.log('Cancel')
    io.emit('Cancel', 'Cancel')
  })
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id)
    users = users.filter((u) => u.id !== socket.id)
  })
})

//
const socketMiddleware = async (req, res, next) => {
  const a = users.filter((u) => u.userID === req.body.data.axeCreatorID)
  req.body.socketID = a[0] ? a[0].id : null
  await next()
}

app.use(cors())
app.use(bodyParser.json())
app.io = io

// Admin
app.post('/createAccount', UserController.createAccount)
app.get('/getActivity', AdminController.getActivity)
app.post('/addCompany', AdminController.addCompany)
app.get('/getCompanies', AdminController.getCompanies)

// User
app.post('/signin', UserController.signIn)
app.post('/customList', UserController.customList)

// Search
app.post('/search', SearchController.search)
app.post('/submitAxe', AxeController.submitAxe)
app.patch('/updateAxe', AxeController.updateAxe)
app.post('/viewAxe', SearchController.viewAxe)

// Trade
app.post('/trade', socketMiddleware, TradeController.trade)

server.listen(port, () => console.log(`AM backend listening on port ${port}!`))

module.exports = { users }
