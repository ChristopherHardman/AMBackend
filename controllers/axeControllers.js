const WebSocket = require('ws');
const DB = require('../dbConnect');

const submitAxe = async (req, res) => {
  try {
    console.log('Submit Axe', req.body)
    DB.addAxe(req.body.axe)
    setTimeout(()=> res.sendStatus(200), 500)

  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  submitAxe
};
