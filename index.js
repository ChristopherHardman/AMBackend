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

// let users = {}
// io.use((socket, next) => {
//   let token = socket.handshake.query.token;
//   console.log('USING', token);
//   return next()
// });

io.on('connection', async (socket) => {
  console.log('****', socket.id, socket.handshake.query.token);
  const a = socket.id
  io.to(a).emit('justConnected', socket.id)

  // Do we need this?
  socket.on('token', (data) => {
    // users[data.userID] = data.socketID
    socket.join(data.company)
    socket.join(data.userID)
  })

  socket.on('Decline', (data) => TradeController.decline(data))

  socket.on('pickup', async (data) => TradeController.pickup(data, io))

  socket.on('SendPrice', (data) => TradeController.sendPrice(data, io))

  socket.on('SendDelta', (data) => TradeController.sendDelta(data, io))

  socket.on('RequestDelta', (data) => TradeController.requestDelta(data, io))

  socket.on('Disagree', (data) => TradeController.disagree(data, io))

  socket.on('Accept', (data) => TradeController.accept(data, io))

  socket.on('AcknowledgeToDeal', (data) =>
    TradeController.acknowledgeToDeal(data, io)
  )

  socket.on('SendFinalDetails', (data) => TradeController.sendFinalDetails(data, io))

  socket.on('ClientAccept', (data) => TradeController.clientAccept(data, io))

  socket.on('ConfirmResolved', (data) => TradeController.confirmResolved(data, io))

  socket.on('Finish', (data) => TradeController.finish(data, io))

  socket.on('TimedOut', (data) => TradeController.timedOut(data, io))
  socket.on('Release', (data) => TradeController.release(data, io))
  socket.on('RefPrice', (data) => TradeController.refPrice(data, io))
  socket.on('RefRFQ', (data) => TradeController.refRFQ(data, io))
  socket.on('Cancel', (data) => TradeController.cancelTrade(data, io))

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id)
    // users = users.filter((u) => u.socketID !== socket.id)
  })
})

// const socketMiddleware = async (req, res, next) => {
//   req.body.activeTraders = users
//   await next()
// }

app.use(cors())
app.use(bodyParser.json())
app.io = io

// Admin
app.post('/createAccount', UserController.createAccount)
app.get('/getActivity', AdminController.getActivity)
app.post('/addCompany', AdminController.addCompany)
app.get('/getCompanies', AdminController.getCompanies)
app.get('/getTradingLog', AdminController.getTradingLog)
app.post('/populate', AdminController.populate)
app.get('/getUsers', AdminController.getUsers)

// User
app.post('/signin', UserController.signIn)
app.post('/customList', UserController.customList)
app.post('/deleteCustomList', UserController.deleteCustomList)
app.post('/savePreferences', UserController.savePreferences)

// Search
app.post('/search', SearchController.search)
app.post('/submitAxe', AxeController.submitAxe)
app.patch('/pauseAll', AxeController.pauseAll)
app.patch('/updateAxe', AxeController.updateAxe)
app.post('/viewAxe', SearchController.viewAxe)

// Trade
app.post('/RFQ', TradeController.RFQ)
app.post('/pickup', TradeController.pickup)

// Error handling
app.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).json({ error: error.toString() })
})

server.listen(port, () => console.log(`AM backend listening on port ${port}!`))
