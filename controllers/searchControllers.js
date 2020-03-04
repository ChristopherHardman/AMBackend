
// const wss = require('../index.js')
const WebSocket = require('ws');

const Samples = [
  {currencyPair: 'AUDUSD',
    buySell: 'Sell',
    dateTenor: 'O/N',
    strike: 'ATMS',
    vol: 12.25,
    spotRef: 0.7101,
    premium: 0.32,
    liveSpot: 0.71707,
    cp: 'C',
    traderName: 'Olivia Evans',
    amountFilled: 50
  },
  {currencyPair: 'EURAUD',
    buySell: 'Buy',
    dateTenor: 'O/N',
    strike: '1.6025',
    vol: 13.1,
    spotRef: 1.6012,
    premium: 0.28,
    liveSpot: 0.6005,
    cp: 'C / P',
    traderName: 'Alfie Wood',
    amountFilled: 75
  },
  {currencyPair: 'AUDUSD',
    buySell: 'Sell',
    dateTenor: 'O/N',
    strike: 'ATMS',
    vol: 12.25,
    spotRef: 0.7101,
    premium: 0.32,
    liveSpot: 0.71707,
    cp: 'C',
    traderName: 'Olivia Evans',
    amountFilled: 50
  },
  {currencyPair: 'EURAUD',
    buySell: 'Buy',
    dateTenor: 'O/N',
    strike: '1.6025',
    vol: 13.1,
    spotRef: 1.6012,
    premium: 0.28,
    liveSpot: 0.6005,
    cp: 'C / P',
    traderName: 'Alfie Wood',
    amountFilled: 75
  },
]


const search = async (req, res) => {
  try {
    console.log('search', req.body)
    // const wss = new WebSocket.Server({ port: 80 });
    // wss.on('connection', function connection(ws, req) {
    //   ws.on('message', function incoming(message) {
    //     console.log('received: %s', message);
    //   })
    //   ws.send('something else');
    //   ws.close()
    // });

    setTimeout(()=> res.send(Samples), 500)

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}


module.exports = {search};
