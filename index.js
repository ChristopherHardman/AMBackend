const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const UserController = require('./controllers/userControllers')
const SearchController = require('./controllers/searchControllers')
const AxeController = require('./controllers/axeControllers')

const port = process.env.PORT || 3001;

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

const app = express()
app.use(cors())
app.use(bodyParser.json())


app.post('/signin', UserController.signIn)
app.post('/search', SearchController.search)
app.post('/submitAxe', AxeController.submitAxe)

app.get('/', (req, res) => res.send('Hello World!'))


app.listen(port, () => console.log(`Example app listening on port ${port}!`))
