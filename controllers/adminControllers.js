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
    const activity = req.body.label === 'add' ? await DB.addCompany(req.body.company) : await DB.updateCompany(req.body.company)
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

const getUsers = async (req, res) => {
  try {
    console.log('Get Users', req.body)
    const users = await DB.getUsers()
    res.send(users)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}

const getTradingLog = async (req, res) => {
  try {
    console.log('Get Trading Log')
    const transactions = await DB.getTransactions()
    res.send(transactions)
  } catch (error) {
    console.log('ERROR', error)
    res.sendStatus(500)
  }
}


// Used during testing to add sample companies and users into DB
const populate = async () => {
  console.log('Populate');
  const Companies = [
    { clients: [], name: 'HSBC', type: 'Bank' },
    { clients: [], name: 'Hedge Fund 1', type: 'Hedge Fund' },
    { clients: [], name: 'ABC Institutional', type: 'Institutional' },
    { clients: [], name: 'Corp Co', type: 'Corp' },
    { clients: [], name: 'Agency (UK)', type: 'Agency' },
  ]

  const Users = [
    {
      firstName: 'Sample',
      lastName: 'User-1',
      email: 'c@c.com',
      password: '123',
      location: 'London',
      type: 'Bank-Sales',
    },
    {
      firstName: 'Sample',
      lastName: 'User-2',
      email: 'c@c.com',
      password: '123',
      location: 'New York',
      type: 'Bank-Sales',
    },
    {
      firstName: 'Sample',
      lastName: 'User-3',
      email: 'c@c.com',
      password: '123',
      location: 'London',
      type: 'Bank-Sales',
    },
    {
      firstName: 'Sample',
      lastName: 'User-4',
      email: 'c@c.com',
      password: '123',
      location: 'Tokyo',
      type: 'Bank-Sales',
    },
    {
      firstName: 'Sample',
      lastName: 'User-5',
      email: 'c@c.com',
      password: '123',
      location: 'Tokyo',
      type: 'Bank-Sales',
    },
  ]

  for (const company of Companies) {
    const a = await DB.addCompany(company)
  }

  const addedCompanies = await DB.getCompanies()

  for (const company of addedCompanies) {
    for (const user of Users) {
      const newUser = { ...user, email: `${company.id}-${user.lastName}`, company: company.id }
      await DB.createAccount(newUser)
      console.log('New USER')
    }
  }
}

// populateDB()

module.exports = {
  getActivity,
  addCompany,
  getCompanies,
  getTradingLog,
  getUsers,
  populate
}
