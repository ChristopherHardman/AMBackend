const DB = require('../dbConnect')

const getActivity = async (req, res, next) => {
  const activity = await DB.getActivity().catch(next)
  return res.send(activity)
}

const addCompany = async (req, res, next) => {
  const activity =
    req.body.label === 'add'
      ? await DB.addCompany(req.body.company).catch(next)
      : await DB.updateCompany(req.body.company).catch(next)
  res.sendStatus(200)
}

const getCompanies = async (req, res, next) => {
  const companies = await DB.getCompanies().catch(next)
  res.send(companies)
}

const getUsers = async (req, res, next) => {
  const users = await DB.getUsers().catch(next)
  res.send(users)
}

const getTradingLog = async (req, res, next) => {
  const transactions = await DB.getTransactions().catch(next)
  res.send(transactions)
}

// Used during testing to add sample companies and users into DB
const populate = async () => {
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

module.exports = {
  getActivity,
  addCompany,
  getCompanies,
  getTradingLog,
  getUsers,
  populate
}
