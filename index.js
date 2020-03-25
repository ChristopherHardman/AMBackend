const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const UserController = require('./controllers/userControllers')
const SearchController = require('./controllers/searchControllers')
const AxeController = require('./controllers/axeControllers')

// const app = require('express')();

const port = process.env.PORT || 3001

// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });
//
// wss.on('connection', function connection(ws, req) {
//   ws.on('message', function incoming(message) {
//     console.log('received: %s', message, wss.clients);
//     // ws.send('something');
//     wss.clients.forEach(function each(client) {
//         client.send('something');
//   })
// })
// });

let users = []

io.on('connection', (socket) => {
  console.log('New client connected')
  socket.on('token', (data) => {
    console.log('ddddd', data)
    users.push({ id: socket.id, userID: data })
    console.log('UUU', users)
  })
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id)
    users = users.filter((u) => u.id !== socket.id)
    console.log('uuu222', users)
  })
})

const socketMiddleware = async (req, res, next) => {
  console.log('99999', req.body, users)
  const a = users.filter((u) => u.userID === req.body.data.axeCreatorID)
  console.log(a)
  req.body.socketID = a[0] ? a[0].id : null
  await next()
}

// const app = express()
app.use(cors())
app.use(bodyParser.json())
app.io = io
app.post('/createAccount', UserController.createAccount)
app.post('/signin', UserController.signIn)
app.post('/search', SearchController.search)
app.post('/submitAxe', AxeController.submitAxe)
app.post('/viewAxe', SearchController.viewAxe)
app.post('/trade', socketMiddleware, SearchController.trade)

server.listen(port, () => console.log(`AM backend listening on port ${port}!`))

module.exports = { users }
