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


const addCompany = async (req, res) => {
  try {
    console.log('Add Comapny', req.body)
    const activity = await DB.addCompany(req.body)
    res.sendStatus(200)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}


const getCompanies = async (req, res) => {
  try {
    console.log('Add Comapny', req.body)
    const companies = await DB.getCompanies()
    res.send(companies)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}


module.exports = {
  getActivity,
  addCompany,
  getCompanies
}
