const { Sequelize, Op } = require('sequelize')
const bcrypt = require('bcrypt')
const Email = require('./nodemailer')

const saltRounds = 10
const Environment = 'development'
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
// Axe.sync({ force: true })
// Tracker.sync({ force: true })
// Company.sync({ force: true })
// CustomList.sync({ force: true })
// Transaction.sync({ force: true })

const recordActivity = async (type, user) => {
  const newEvent = new Tracker({ type, user })
  await newEvent.save()
}

const generateFilter = (query, type, companyID) => {
  console.log('******', query, type, companyID);
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
  // if (type !== 'Bank') filter.where.excludeList = { [Op.notIn]: [companyID] }
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
  if (query.filter) {
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
        [Op.or]: ['One Touch (American)', 'European Digi', 'RKO'],
      }
    }
    if (query.filter !== 'O/N' && query.filter !== '1st Gen Exotics') filter.where.category = query.filter
  }
  return filter
  // Filters	Description	Examples
  // O/N	Only O/N options i.e. 1 day options expiring next day	All options with 1 day expiry
  // Vanilla G10	Simple options, on developed currencies.  Buyer has right to exercise option on expiry date. 	USD, EUR, JPY, CAD, GBP, CHF, NOK, SEK, AUD, NZD, DKK
  // Vanilla EM	Simple options, on Emerging Market currencies. Buyer has right to exercise option on expiry date. 	TRT, ZAR, MXN, RUB, PLN, HUF, CNH, ILS, SGD, HKD, CZk, RON, and all NDF currencies (List 3 on "Curency Pairs Tab)
  // 1st Gen Exotics	Exotic options typically trigger when the currency reaches the strike price. They can have additional features such as knock-outs for example.	Digitals (DIGI), One-Touch (OT), No Touch (NT), Knock-Outs (KO), Knock-in (KI), Reverse Knock Outs(RKO), Window Knock-outs (WKO), Double Knock-Out (DKO)
  // Vol/Var	Volatility Swap (Vol swap), Variance Swap (Var swap).	1M EURUSD Vol Swap to sell at 9.5%
  // Correlation 	Correlation Options involve more than one product	Dual & Triple Digitals, Worst-Ofs.
}

const getAxes = async (request) => {
  const { query, userID, company } = request
  const { type, id } = await getCompany(company)
  const filterApplied = generateFilter(query, type, id)
  console.log('FA', filterApplied);
  const results = await Axe.findAll(filterApplied)
  const array = results.map((a) => a.dataValues)
  const user = await getUser(userID)
  // Remove sensitive information and any axes that a company has been excluded from
  if (user.type === 'Client') {
    const newArray = array
      .filter((a) => !a.excludeList.includes(company))
      .map(
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
    return newArray
  }
  if (user.type === 'Bank-Sales') {
    const newArray = array.map(({ notional, views, ...axe }) => axe)
    return newArray
  }
  if (user.type === 'Bank-Trader') return array
}

const getAxe = async (userID, axeID) => {
  const user = await getUser(userID)
  const axe = await Axe.findByPk(axeID)
  const dataToSend = await Axe.findByPk(axeID).then((data) =>
    data.get({ plain: true })
  )
  // Remove sensitive information and any axes that a company has been excluded from
  if (user.type === 'Client') {
    // Assuming we are only counting client views
    axe.views = axe.views ? axe.views + 1 : 1
    await axe.save()
    delete dataToSend.traderName
    delete dataToSend.company
    dataToSend.excludeList = []
    delete dataToSend.userID
    delete dataToSend.notional
    delete dataToSend.views
    return dataToSend
  }
  if (user.type === 'Bank-Sales') {
    delete dataToSend.notional
    delete dataToSend.views
    return dataToSend
  }
  if (user.type === 'Bank-Trader') return axe
}

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
  axe.category = categoriseAxe(axe)
  axe.status = 'active'
  axe.capacity = axe.notional || axe.notional1
  axe.tradeStatus = 'available'
  const newAxe = new Axe(axe)
  const result = await newAxe.save()
  if (result.dataValues) {
    recordActivity('New Axe Created', axe.userID)
    Email.appAlerts('New Axe Created', axe.userID)
    return 200
  }
  return 401
}

const updateAxe = async (axe) => {
  const update = await Axe.update(axe, { where: { id: axe.id } })
  if (update[0] === 1) return 'success'
  return null
}

const createAccount = async (user) => {
  const uniqueEmail = await User.findAll({ where: { email: user.email } })
  if (uniqueEmail.length > 0) return 401
  if (uniqueEmail.length === 0) {
    user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(user.password, saltRounds, function(err, hash) {
          if (err) reject(err)
          resolve(hash)
        });
      })
      user.password = hashedPassword
      const newUser = new User(user)
      await newUser.save()

    // const rrr = await bcrypt.hash(user.password, saltRounds, function (err, hash) {
    //   user.password = hash
    //   const newUser = new User(user)
    //   let a =  newUser.save()
    //   console.log('1', a);
    // }).then(r => {

      const uuu = await User.findAll({ where: { email: user.email } })
      const company = await Company.findByPk(uuu[0].company)
      company.staff = company.staff ? [...company.staff, uuu[0].id] : [uuu[0].id]
      await company.save()
      const companyUpdated = await Company.findByPk(uuu[0].company)
    return 200
  }
}

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
    console.log('CLIENTS', company.clients);

    const clients = await generateClientList(company.clients)
    const dataToSend = {
      firstName: details.firstName,
      lastName: details.lastName,
      id: details.id,
      email: details.email,
      company: details.company,
      customLists,
      notifications: details.notifications ? details.notifications : [],
      productPreferences: details.productPreferences
        ? details.productPreferences
        : [],
      type: details.type,
      clients
    }
    Email.appAlerts('Login', `${details.firstName} ${details.lastName} `)
    return dataToSend
  }
}


const generateClientList = async (clients) => {
  let res = []

  for (const client of clients) {
    let a = { staff: []}
    const comp = await Company.findByPk(client)
    a.name = comp.name
    if (comp.staff) {
      for (const staff of comp.staff) {
        let person = {}
        const user = await User.findByPk(staff)
        person.firstName = user.firstName
        person.lastName = user.lastName
        person.location = user.location
        a.staff.push(person)
      }
    }
    res.push(a)
  }

  console.log('****', res);
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

const getUser = async (userID) => {
  const user = await User.findAll({ where: { id: userID } })
  return user.map((a) => a.dataValues)[0]
}

const getActivity = async () => {
  const results = await Tracker.findAll()
  return results.map((a) => a.dataValues)
}

const addCompany = async (company) => {
  const newCompany = new Company(company)
  await newCompany.save()
}

const getCompanies = async () => {
  const results = await Company.findAll()
  return results.map((a) => a.dataValues)
}

const getCompany = async (companyID) => {
  const user = await Company.findAll({ where: { id: companyID } })
  return user.map((a) => a.dataValues)[0]
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

// Trade
const checkCapacity = async (axeID, amount) => {
  const axe = await Axe.findByPk(axeID)
  const check = axe.capacity >= amount
  return { capacity: check, remaining: axe.capacity}
}

const updateCapacity = async (axeID, amount) => {
  const axe = await Axe.findByPk(axeID)
  axe.capacity -= amount
  await axe.save()
}

const checkTradeStatus = async (axeID) => {
  const axe = await Axe.findByPk(axeID)
  return axe.tradeStatus === 'available'
}

const updateTradeStatus = async (axeID, status) => {
  const axe = await Axe.findByPk(axeID)
  axe.tradeStatus = status
  await axe.save()
}

const getCompanyIDfromAxe = async (axeID) => {
  const axe = await Axe.findByPk(axeID)
  return axe.company
}


// Transaction tracking
const createTransaction = async (transaction) => {
  const newTransaction = new Transaction(transaction)
  const result = await newTransaction.save()
  return result.id
}

const updateTransaction = async (transactionID, updates) => {
  const update = await Transaction.update(
    updates,
    { where: { id: transactionID } }
  )
  if (update[0] === 1) return 'success'
  return null
}


const getTransactions = async (request) => {
  const results = await Transaction.findAll()
  const array = results.map((a) => a.dataValues)
  return array
}

module.exports = {
  // Admin
  addCompany,
  createAccount,
  getActivity,
  // User
  addAxe,
  addCustomList,
  deleteCustomList,
  getAxe,
  getAxes,
  getCompany,
  login,
  getUser,
  getCompanies,
  updateAxe,
  savePreferences,
  // Trade
  checkCapacity,
  updateCapacity,
  checkTradeStatus,
  getCompanyIDfromAxe,
  updateTradeStatus,
  // Transaction trackiing
  createTransaction,
  updateTransaction,
  getTransactions,
}
