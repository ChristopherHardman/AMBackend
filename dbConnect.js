const { Sequelize, Op } = require('sequelize')
const bcrypt = require('bcrypt')
const Email = require('./nodemailer')

const saltRounds = 10
const Environment = 'development'
const Deployed = Environment === 'development'
const sequelize = new Sequelize(
  Environment === 'test'
    ? 'postgres://localhost:5432/am'
    : 'postgres://lyltfjkuixdqpr:d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2@ec2-46-137-84-173.eu-west-1.compute.amazonaws.com:5432/dekiitsc4t78r4'
)
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

const Axe = sequelize.import(`${__dirname}/models/axeModel`)
const User = sequelize.import(`${__dirname}/models/userModel`)
const Tracker = sequelize.import(`${__dirname}/models/trackerModel`)
const Company = sequelize.import(`${__dirname}/models/companyModel`)
const CustomList = sequelize.import(`${__dirname}/models/customListModel`)
const Transaction = sequelize.import(`${__dirname}/models/transactionModel`)

// User.sync({ force: true }) // Now the `users` table in the database corresponds to the model definition
Axe.sync({ alter: true })
// Tracker.sync({ force: true })
// Company.sync({ force: true })
// CustomList.sync({ force: true })
// Transaction.sync({ force: true })

// ADMIN

const recordActivity = async (type, user) => {
  const newEvent = new Tracker({ type, user })
  await newEvent.save()
}

const createAccount = async (user) => {
  const uniqueEmail = await User.findAll({ where: { email: user.email } })
  if (uniqueEmail.length > 0) return 401
  if (uniqueEmail.length === 0) {
    user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) reject(err)
        resolve(hash)
      })
    })
    user.password = hashedPassword
    const newUser = new User(user)
    await newUser.save()
    const userRecord = await User.findAll({ where: { email: user.email } })
    const company = await Company.findByPk(userRecord[0].company)
    company.staff = company.staff
      ? [...company.staff, userRecord[0].id]
      : [userRecord[0].id]
    await company.save()
    return 200
  }
}

const getActivity = async () => {
  const results = await Tracker.findAll().map((a) => a.get({ plain: true }))
  return results
}

const addCompany = async (company) => {
  const newCompany = new Company(company)
  await newCompany.save()
}

const updateCompany = async (company) => {
  const update = await Company.update(company, { where: { id: company.id } })
  if (update[0] === 1) return 'success'
  return null
}

const updateUser = async (user) => {
  const update = await User.update(user, { where: { id: user.id } })
  if (update[0] === 1) return 200
  return 500
}

const getCompanies = async () => {
  const results = await Company.findAll().map((a) => a.get({ plain: true }))
  return results
}

const getUsers = async () => {
  const results = await User.findAll().map((a) => a.get({ plain: true }))
  return results
}

const getCompany = async (companyID) => {
  const user = await Company.findAll({ where: { id: companyID } })
  return user.map((a) => a.dataValues)[0]
}

const getTransactions = async (request) => {
  const results = await Transaction.findAll().map((a) => a.get({ plain: true }))
  return results
}

// SEARCH

const generateFilter = (query, type, companyID) => {
  const DateOptions = {
    'O/N': 1,
    '<1w': 7,
    '<2w': 14,
    '<1m': 30,
    '<3m': 90,
    '<6m': 180,
    '<1y': 365,
    '<2y': 730,
    '<5y': 5 * 365,
    '<15y': 15 * 365,
  }
  const now = new Date()
  const filter = {
    where: { expiryDate: { [Op.gt]: now } },
  }
  if (query.deleted) {
    return {
      where: {
        [Op.or]: [{ status: 'delete' }, { expiryDate: { [Op.lt]: now } }],
      },
    }
  }
  if (type === 'Bank') filter.where.status = { [Op.or]: ['active', 'pause'] }
  if (type !== 'Bank') filter.where.status = 'active'
  if (query.callPut) filter.where.callPut = query.callPut
  if (query.product) filter.where.product = query.product
  if (query.buySell) filter.where.direction = query.buySell
  if (type === 'Bank') filter.where.company = companyID
  // if (type !== 'Bank') filter.where.excludeList = { [Op.contains]: [companyID] }
  if (query.currencyPair) filter.where.currencyPair = query.currencyPair
  if (query.date) {
    // How should we apply month calculation?
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + DateOptions[query.date])
    const start = new Date()
    const end = endDate
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    filter.where.expiryDate = { [Op.between]: [start, end] }
  }
  if (query.filter && query.filter !== 'All') {
    if (query.filter === 'O/N') {
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 1)
      const start = new Date()
      const end = endDate
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      filter.where.date = { [Op.between]: [start, end] }
    }
    if (query.filter === '1st Gen Exotics') {
      filter.where.product = {
        [Op.or]: ['One Touch (American)', 'European Digital', 'RKO'],
      }
    }
    if (query.filter !== 'O/N' && query.filter !== '1st Gen Exotics')
      filter.where.category = query.filter
  }
  return filter
}

const getAxes = async (request) => {
  console.log('&&&&&', request);
  const { query, userID, company } = request
  const { type, id } = await getCompany(company)
  const filterApplied = generateFilter(query, type, id)
  const results = await Axe.findAll(filterApplied).map((a) => a.get({ plain: true }))
  if (results.length === 0) return []
  const user = await getUser(userID)
  // Remove sensitive information and any axes that a company has been excluded from
  console.log('RRRRRR', results);
  if (user.type === 'Client') {
    const newArray = results.filter((a) => !a.excludeList.includes(company))

    const arrayToSend = []

    for (const axe of newArray) {
      console.log(axe, axe.company);
      const bank = await Company.findByPk(axe.company)
      console.log('BANK', bank)
      if (bank && bank.clients && bank.clients.includes(company)) arrayToSend.push(axe)
    }

    arrayToSend.map(
      ({
        traderName,
        company,
        excludeList,
        userID,
        // notional,
        views,
        createdAt,
        updatedAt,
        ...axe
      }) => axe
    )
    return arrayToSend
  }
  if (user.type === 'Bank-Sales') {
    const newArray = results.map(({ notional, views, ...axe }) => axe)
    return newArray
  }
  if (user.type === 'Bank-Trader') return results
}

const getAxe = async (userID, axeID) => {
  const user = await getUser(userID)
  const axe = await Axe.findByPk(axeID)
  const dataToSend = await Axe.findByPk(axeID).then((data) =>
    data.get({ plain: true })
  )
  // Remove sensitive information and any axes that a company has been excluded from
  if (user.type === 'Client') {
    axe.views = axe.views ? [...axe.views, userID] : [userID]
    await axe.save()
    delete dataToSend.traderName
    delete dataToSend.company
    dataToSend.excludeList = []
    delete dataToSend.userID
    delete dataToSend.notional
    delete dataToSend.notional1
    delete dataToSend.notional2
    delete dataToSend.views
    return dataToSend
  }
  if (user.type === 'Bank-Sales') {
    axe.views = axe.views ? [...axe.views, userID] : [userID]
    delete dataToSend.notional
    delete dataToSend.views
    return dataToSend
  }
  if (user.type === 'Bank-Trader') {
    const newViews = []
    for (const view of axe.views) {
      const res = await getUserAndCompany(view)
      newViews.push(res)
    }
    axe.views = newViews
    return axe
  }
}

// CREATE & UPDATE AXE

const categoriseAxe = (axe) => {
  const currency1 = axe.currencyPair.substring(0, 3)
  const currency2 = axe.currencyPair.substring(3)
  const G10 = [
    'USD',
    'EUR',
    'JPY',
    'CAD',
    'GBP',
    'CHF',
    'NOK',
    'SEK',
    'AUD',
    'NZD',
    'DKK',
  ]
  if (G10.includes(currency1) && G10.includes(currency2)) return 'Vanilla (G10)'
  return 'Vanilla (EM)'
}

const addAxe = async (axe) => {
  console.log('******', axe);
  axe.category = categoriseAxe(axe)
  axe.status = 'active'
  axe.capacity = axe.notional || axe.notional1
  axe.tradeStatus = 'available'
  axe.views = []
  axe.updater = axe.traderName
  if (!axe.minimumTrade) axe.minimumTrade = 1
  if (!axe.expiryDate) {
    let days
    if (['1D', 'ON', 'O/N'].includes(axe.tenor)) days = 1
    else {
      // let a = axe.tenor.split(/[a-zA-Z]/)
      let n = Number(axe.tenor.slice(0, axe.tenor.length === 2 ? 1 : 2))
      let l = axe.tenor.slice(axe.tenor.length === 2 ? 1 : 2)
      if (l === 'W') n = n * 7
      if (l === 'M') n = n * 30
      if (l === 'Y') n = n * 365
      days = n
    }
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + days)
    axe.expiryDate = expiry
  }
  const newAxe = new Axe(axe)
  const result = await newAxe.save()
  if (result.dataValues) {
    recordActivity('New Axe Created', axe.userID)
    if (Deployed) Email.appAlerts('New Axe Created', axe.userID)
    const now = new Date()
    const filter = {
      where: { expiryDate: { [Op.gt]: now }, company: axe.company },
    }
    const updatedAxes = await Axe.findAll(filter).map((a) => a.get({ plain: true }))
    return updatedAxes
  }
  return 401
}

const updateAxe = async (axe, userID, tradeUpdate) => {
  // TO DO: Protect against multiple edits happening simultaneously
  console.log('EEEDDDDIIIIITTTT', axe);
  if (!tradeUpdate) {
    const check = await getAxeByID(axe.id)
    if (check.notional !== axe.notional) {
      const diff = axe.notional - check.notional
      const newCapacity = check.capacity + diff
      axe.capacity = newCapacity
    }
    delete axe.views
  }
  const { firstName, lastName, company } = await getUser(userID)
  axe.updater = `${firstName} ${lastName}`
  const update = await Axe.update(axe, { where: { id: axe.id } })
  if (update[0] === 1) {
    const now = new Date()
    const filter = {
      where: { expiryDate: { [Op.gt]: now }, company },
    }
    const updatedAxes = await Axe.findAll(filter).map((a) => a.get({ plain: true }))
    return updatedAxes
  }
  return null
}

const pauseAll = async (companyID, label) => {
  const now = new Date()
  const filter = {
    where: { expiryDate: { [Op.gt]: now }, company: companyID },
  }
  const results = await Axe.findAll(filter)
    .map((a) => a.get({ plain: true }))
    .map((a) => a.id)
  console.log(results)
  for (const axe of results) {
    const update = await Axe.update({ status: label }, { where: { id: axe } })
    console.log(update)
  }
  const updatedAxes = await Axe.findAll(filter).map((a) => a.get({ plain: true }))
  return updatedAxes
}

// USER

const login = async ({ email, password }) => {
  const user = await User.findAll({ where: { email } })
  if (user.length === 0) return 'User not recognised'
  const details = user.map((u) => u.dataValues)[0]
  recordActivity('Login', details.id)
  const same = await bcrypt.compare(password, details.password)
  if (!same) return 'Incorrect password'
  if (same) {
    const company = await getCompany(details.company)
    const customLists = company.customLists
      ? await getCustomLists(company.customLists)
      : []
    const clients = await generateClientList(company.clients)
    const dataToSend = {
      firstName: details.firstName,
      lastName: details.lastName,
      id: details.id,
      email: details.email,
      company: details.company,
      companyName: company.name,
      customLists,
      notifications: details.notifications ? details.notifications : [],
      productPreferences: details.productPreferences
        ? details.productPreferences
        : [],
      type: details.type,
      clients,
    }
    Email.appAlerts('Login', `${details.firstName} ${details.lastName} `)
    return dataToSend
  }
}

const generateClientList = async (clients) => {
  const res = []
  for (const client of clients) {
    const a = { staff: [] }
    const comp = await Company.findByPk(client)
    a.name = comp.name
    a.type = comp.type
    a.id = comp.id
    if (comp.staff) {
      for (const staff of comp.staff) {
        const person = {}
        const user = await User.findByPk(staff)
        person.firstName = user.firstName
        person.lastName = user.lastName
        person.location = user.location
        a.staff.push(person)
      }
    }
    res.push(a)
  }
  return res
}

const addCustomList = async ({ userID, company, listName, list }) => {
  if (!userID || !company || !listName || !list) return
  const AAA = await Company.findByPk(company)
  if (!AAA) return 'Company not recognised'
  const newCL = new CustomList({ name: listName, company, list, user: userID })
  await newCL.save()
  AAA.customLists = AAA.customLists ? [...AAA.customLists, newCL.id] : [newCL.id]
  await AAA.save()
  const BBB = await Company.findByPk(company)
  const newCustomLists = await getCustomLists(BBB.customLists)
  return { customLists: newCustomLists }
}

const deleteCustomList = async ({ company, listID }) => {
  const AAA = await Company.findByPk(company)
  AAA.customLists = AAA.customLists.filter((l) => l !== listID)
  await AAA.save()
  const list = await CustomList.findByPk(listID)
  await list.destroy()
  const BBB = await Company.findByPk(company)
  const newCustomLists = await getCustomLists(BBB.customLists)
  return { customLists: newCustomLists }
}

const savePreferences = async ({ id, label, preferences }) => {
  const AAA = await User.findByPk(id)
  AAA[label] = preferences
  await AAA.save()
  const BBB = await User.findByPk(id)
  return { [label]: BBB[label] }
}

const getCustomLists = async (listIDs) => {
  const lists = await CustomList.findAll({
    where: {
      id: {
        [Op.or]: listIDs,
      },
    },
  })
  return lists
}

// TRADE

const updateCapacity = async (axeID, amount) => {
  const axe = await Axe.findByPk(axeID)
  axe.capacity -= amount
  await axe.save()
}

const updateTradeStatus = async (axeID, status) => {
  const updates = { status }
  const update = await Axe.update(updates, { where: { id: axeID } })
}

const getCompanyIDfromAxe = async (axeID) => {
  const axe = await Axe.findByPk(axeID)
  return axe.company
}

const getAxeByID = async (axeID) => {
  const axe = await Axe.findByPk(axeID).then((data) => data.get({ plain: true }))
  return axe
}

// Transaction tracking
const createTransaction = async (transaction) => {
  const newTransaction = new Transaction(transaction)
  const result = await newTransaction.save()
  return result.id
}

const updateTransaction = async (transactionID, updates) => {
  const update = await Transaction.update(updates, { where: { id: transactionID } })
  if (update[0] === 1) return 'success'
  return null
}

const getTransaction = async (transactionID) => {
  const transaction = await Transaction.findByPk(transactionID).then((data) =>
    data.get({ plain: true })
  )
  return transaction
}

// UTILS
const getUser = async (userID) => {
  const user = await User.findAll({ where: { id: userID } })
  return user.map((a) => a.dataValues)[0]
}

const getUserAndCompany = async (userID) => {
  const {
    firstName,
    lastName,
    company,
    type,
    telephone,
    location,
  } = await User.findByPk(userID)
  const { name } = await Company.findByPk(company)
  return { company: name, type, firstName, lastName, telephone, location }
}

module.exports = {
  // Admin
  addCompany,
  createAccount,
  getActivity,
  updateCompany,
  getUsers,
  updateUser,
  // User
  addAxe,
  addCustomList,
  deleteCustomList,
  getAxe,
  getAxes,
  getCompany,
  login,
  getUser,
  getUserAndCompany,
  getCompanies,
  pauseAll,
  updateAxe,
  savePreferences,
  updateCapacity,
  getAxeByID,
  getCompanyIDfromAxe,
  updateTradeStatus,
  // Transaction trackiing
  createTransaction,
  updateTransaction,
  getTransaction,
  getTransactions,
}
