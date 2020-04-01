const { Pool } = require('pg')

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'am',
  password: 'password',
  port: 5432,
})
const { Op } = require('sequelize')
// const pool = new Pool({
//   user: 'lyltfjkuixdqpr',
//   host: 'ec2-46-137-84-173.eu-west-1.compute.amazonaws.com',
//   database: 'dekiitsc4t78r4',
//   password: 'd5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2',
//   port: 5432,
// })
// "dbname=dekiitsc4t78r4 host=ec2-46-137-84-173.eu-west-1.compute.amazonaws.com port=5432 user=lyltfjkuixdqpr password=d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2 sslmode=require"
// Connection URL:
// postgres://lyltfjkuixdqpr:d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2@ec2-46-137-84-173.eu-west-1.compute.amazonaws.com:5432/dekiitsc4t78r4

const bcrypt = require('bcrypt')
const saltRounds = 10
const Sequelize = require('sequelize')

const sequelize = new Sequelize('postgres://localhost:5432/am')
// const sequelize = new Sequelize('postgres://lyltfjkuixdqpr:d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2@ec2-46-137-84-173.eu-west-1.compute.amazonaws.com:5432/dekiitsc4t78r4')
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

User.sync({ force: true }) // Now the `users` table in the database corresponds to the model definition
Axe.sync({ force: true })
Tracker.sync({ force: true })

// To add: deltaAmount, deltaCurrency, salesCredit
const recordActivity = async (type, user) => {
  const newEvent = new Tracker({ type, user })
  await newEvent.save()
}

const generateFilter = (query) => {
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
  const filter = {
    where: {},
  }
  // filter.where.status = 'active'
  if (query.callPut) filter.where.callPut = query.callPut
  if (query.product) filter.where.product = query.product
  if (query.buySell) filter.where.direction = query.buySell
  if (query.currencyPair) filter.where.currencyPair = query.currencyPair
  if (query.date) {
    // How should we apply month calculation?
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + DateOptions[query.date])
    const start = new Date()
    const end = endDate
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    filter.where.date = { [Op.between]: [start, end] }
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
    if (query.filter !== 'O/N') filter.where.category = query.filter
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

const getAxes = async (query) => {
  const filterApplied = generateFilter(query)
  const results = await Axe.findAll(filterApplied)
  return results.map((a) => a.dataValues)
}

const getAxe = async (axeID) => {
  const axe = await Axe.findAll({ where: { id: axeID } })
  return axe.map((a) => a.dataValues)
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
  axe.created = new Date()
  const newAxe = new Axe(axe)
  await newAxe.save()
  recordActivity('New Axe Created', axe.userID)

}

const updateAxe = async (axe) => {
  const {
    traderName,
    currencyPair,
    excludeList,
    product,
    direction,
    notional,
    date,
    strike,
    callPut,
    volPrice,
    spot,
    premium,
    premiumCurrency,
    KOStrike,
    minimumTrade,
    category,
    status,
    cut,
    delta,
  } = axe

  const update = await Axe.update(
    {
      traderName,
      currencyPair,
      excludeList,
      product,
      direction,
      notional,
      date,
      strike,
      callPut,
      volPrice,
      spot,
      premium,
      premiumCurrency,
      KOStrike,
      minimumTrade,
      category,
      status,
      cut,
      delta,
    },
    { where: { id: axe.id } }
  )
  if (update[0] === 1) return 'success'
  return null
}

const deleteAxe = async (axeID) => {
  pool.query('DELETE FROM users WHERE id = $1', [id])
}

const createAccount = async (user) => {
  const uniqueEmail = await User.findAll({ where: { email: user.email } })
  // const uniqueEmail = await UserModel.findOne({email : email.toLowerCase()})
  // if (uniqueEmail && uniqueEmail.verified ) return 'Already registered';
  user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
  user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)
  await bcrypt.hash(user.password, saltRounds, function (err, hash) {
    user.password = hash
    const newUser = new User(user)
    newUser.save()
  })
  return 'Success'
}

const login = async ({ email, password }) => {
  const user = await User.findAll({ where: { email } })
  if (user.length === 0) return 'User not recognised'
  const details = user.map((u) => u.dataValues)
  recordActivity('Login', details[0].id)
  const same = await bcrypt.compare(password, details[0].password)
  return same ? details[0] : 'Incorrect password'
}

const getUser = async (userID) => {
  const user = await User.findAll({ where: { id: userID } })
  return user.map((a) => a.dataValues)[0]
}


const getActivity = async () => {
  const results = await Tracker.findAll()
  return results.map((a) => a.dataValues)
}


module.exports = {
  addAxe,
  getAxe,
  getAxes,
  createAccount,
  login,
  getUser,
  getActivity,
  updateAxe,
}

// const User = sequelize.define(
//   'users',
//   {
//     firstName: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     lastName: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     password: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     company: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     type: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     customList: {
//       type: Sequelize.ARRAY(Sequelize.STRING),
//       // allowNull: false
//     },
//     id: {
//       // type: Sequelize.UUID,
//       // defaultValue: Sequelize.UUIDV4, // Or Sequelize.UUIDV1,
//       // primaryKey: true
//       allowNull: false,
//       primaryKey: true,
//       type: Sequelize.UUID,
//       defaultValue: Sequelize.UUIDV4,
//     },
//   },
//   {
//     // options
//   }
// )

// const Axe = sequelize.define(
//   'axes',
//   {
//     traderName: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     currencyPair: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     excludeList: {
//       type: Sequelize.ARRAY(Sequelize.STRING),
//       // allowNull: false
//     },
//     product: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     direction: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     notional: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//     },
//     date: {
//       type: Sequelize.DATE,
//       allowNull: false,
//     },
//     strike: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//     },
//     callPut: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     volPrice: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//     },
//     spot: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//     },
//     premium: {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//     },
//     premiumCurrency: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     userID: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     category: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     id: {
//       allowNull: false,
//       primaryKey: true,
//       type: Sequelize.UUID,
//       defaultValue: Sequelize.UUIDV4,
//     },
//   },
//   {
//     // options
//   }
// )
// Axe.sync({ force: true })
