const DB = require('../dbConnect');
// const wss = require('../index.js')
const WebSocket = require('ws');

const Samples = [
  {currencyPair: 'AUDUSD',
    buySell: 'Sell',
    date: 'O/N',
    strike: 'ATMS',
    vol: 12.25,
    spotRef: 0.7101,
    premium: 0.32,
    liveSpot: 0.71707,
    callPut: 'C',
    traderName: 'Olivia Evans',
    amountFilled: 50,
    id: 1
  },
  {currencyPair: 'EURAUD',
    buySell: 'Buy',
    date: 'O/N',
    strike: '1.6025',
    vol: 13.1,
    spotRef: 1.6012,
    premium: 0.28,
    liveSpot: 0.6005,
    callPut: 'C / P',
    traderName: 'Alfie Wood',
    amountFilled: 75,
    id: 2
  },
  {currencyPair: 'AUDUSD',
    buySell: 'Sell',
    date: 'O/N',
    strike: 'ATMS',
    vol: 12.25,
    spotRef: 0.7101,
    premium: 0.32,
    liveSpot: 0.71707,
    callPut: 'C',
    traderName: 'Olivia Evans',
    amountFilled: 50,
    id: 3
  },
  {currencyPair: 'EURAUD',
    buySell: 'Buy',
    date: 'O/N',
    strike: '1.6025',
    vol: 13.1,
    spotRef: 1.6012,
    premium: 0.28,
    liveSpot: 0.6005,
    callPut: 'C / P',
    traderName: 'Alfie Wood',
    amountFilled: 75,
    id: 4
  },
  {currencyPair: 'AUDUSD',
    buySell: 'Sell',
    date: 'O/N',
    strike: 'ATMS',
    vol: 12.25,
    spotRef: 0.7101,
    premium: 0.32,
    liveSpot: 0.71707,
    callPut: 'C',
    traderName: 'Olivia Evans',
    amountFilled: 50,
    id: 5
  },
  {currencyPair: 'EURAUD',
    buySell: 'Buy',
    date: 'O/N',
    strike: '1.6025',
    vol: 13.1,
    spotRef: 1.6012,
    premium: 0.28,
    liveSpot: 0.6005,
    callPut: 'C / P',
    traderName: 'Alfie Wood',
    amountFilled: 75,
    id: 6
  },
]


const search = async (req, res) => {
  try {
    console.log('search', req.body)
    const results = await DB.getAxes(req.body.query)
    // const wss = new WebSocket.Server({ port: 80 });
    // wss.on('connection', function connection(ws, req) {
    //   ws.on('message', function incoming(message) {
    //     console.log('received: %s', message);
    //   })
    //   ws.send('something else');
    //   ws.close()
    // });
    res.send(results)

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}


const viewAxe = async (req, res) => {
  try {
    console.log('search', req.body)
    const { axeID } = req.body;
    const result = await DB.getAxe(axeID)
    // let axe = Samples.filter( s => s.id === req.body.axeID)
    res.send(result)

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}



module.exports = {search, viewAxe};
