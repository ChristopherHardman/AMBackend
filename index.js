const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const DB = require('./dbConnect')
const AdminController = require('./controllers/adminControllers')
const AxeController = require('./controllers/axeControllers')
const SearchController = require('./controllers/searchControllers')
const TradeController = require('./controllers/tradeControllers')
const UserController = require('./controllers/userControllers')
const Email = require('./nodemailer')

const port = process.env.PORT || 3001

let users = []

io.on('connection', (socket) => {
  socket.on('token', (data) => {
    users.push({ id: socket.id, userID: data })
  })
  socket.on('pickup', (data) => {
    io.emit('Pickup', 'Pickup')
  })
  socket.on('fullDetails', (data) => {
    console.log('FULL Details')
    fullDetails(data)
  })
  socket.on('submitChanges', (data) => {
    console.log('Submit Changes', data)
    DB.updateTransaction(data.transactionID, {
      pricingVolChange: data.pricingVol,
      pricingVolChangeDate: new Date()
    })
    io.emit('submitChanges', data)
  })
  socket.on('confirmPriceChange', () => {
    console.log('CONFIRM PRICE CHANGE');
    io.emit('ConfirmPriceChange', 'ConfirmPriceChange')
  })
  socket.on('tradeConfirmed', () => {
    io.emit('TradeConfirmed', 'TradeConfirmed')
  })
  socket.on('TradeConfirmedClient', (data) => {
    tradeConfirmedClient(data)
    // console.log('TCC')
    // io.emit('TradeConfirmedClient')
    // Email.confirmTrade('confirmations@axedmarkets.com', details)
  })
  socket.on('refQuote', () => {
    console.log('refQuote')
    io.emit('refQuote', 'refQuote')
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


const fullDetails = async (data) => {
  const {firstName, lastName, company} = await DB.getUser(data.userID)
  data.traderName = `${firstName} ${lastName}`
  const {name} =  await DB.getCompany(company)
  data.companyName = name
  io.emit('fullDetails', data)
  const transactionUpdate = {
    confirmTime: new Date(),
    bankTrader: data.userID,
    confirmedAmount: data.amount,
    forwardDate: data.forwardDate,
    confirmedPrice: data.price,
    optionPremium: data.optionPremium
  }
  DB.updateTransaction(data.transactionID, transactionUpdate)
}


const tradeConfirmedClient = async (data) => {
  console.log('%%%%%%%%%', data);
  const { name } = await DB.getCompany(data.company)
  io.emit('TradeConfirmedClient')
  const details = `${name} buys ${data.amount}...`
  DB.updateCapacity(data.axeID, data.amount)
  Email.confirmTrade('confirmations@axedmarkets.com', details)
  const transactionUpdate = {
    completeTime: new Date(),
  }
  DB.updateTransaction(data.transactionID, transactionUpdate)
}

//
const socketMiddleware = async (req, res, next) => {
  console.log('rrrr', req.body);
  const companyID = await DB.getCompanyIDfromAxe(req.body.data1.axeID)
  const a = users.filter((u) => u.userID === companyID)
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
app.patch('/updateAxe', AxeController.updateAxe)
app.post('/viewAxe', SearchController.viewAxe)

// Trade
app.post('/trade', socketMiddleware, TradeController.trade)

server.listen(port, () => console.log(`AM backend listening on port ${port}!`))

module.exports = { users }
