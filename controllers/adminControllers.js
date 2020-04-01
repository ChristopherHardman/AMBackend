const DB = require('../dbConnect')

const getActivity = async (req, res) => {
  try {
    console.log('Get Activity', req.body)
    const activity = await DB.getActivity()
    res.send(activity)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

module.exports = {
  getActivity
}
