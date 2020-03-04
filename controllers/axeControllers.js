const WebSocket = require('ws');

const submitAxe = async (req, res) => {
  try {
    console.log('Submit Axe', req.body)
    // const wss = new WebSocket.Server({ port: 8080 });
    // wss.on('connection', function connection(ws, req) {
    //   // ws.on('message', function incoming(message) {
    //   //   console.log('received: %s', message);
    //   // })
    //   ws.send('something else');
    // });
    // wss.close()
    setTimeout(()=> res.sendStatus(200), 500)


  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {submitAxe};
