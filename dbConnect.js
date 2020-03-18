const Pool = require('pg').Pool
// const pool = new Pool({
//   user: 'me',
//   host: 'localhost',
//   database: 'am',
//   password: 'password',
//   port: 5432,
// })
const pool = new Pool({
  user: 'lyltfjkuixdqpr',
  host: 'ec2-46-137-84-173.eu-west-1.compute.amazonaws.com',
  database: 'dekiitsc4t78r4',
  password: 'd5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2',
  port: 5432,
})
//"dbname=dekiitsc4t78r4 host=ec2-46-137-84-173.eu-west-1.compute.amazonaws.com port=5432 user=lyltfjkuixdqpr password=d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2 sslmode=require"
// Connection URL:
 //postgres://lyltfjkuixdqpr:d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2@ec2-46-137-84-173.eu-west-1.compute.amazonaws.com:5432/dekiitsc4t78r4

 const bcrypt = require('bcrypt');
 const saltRounds = 10;

const Sequelize = require('sequelize')
// const sequelize = new Sequelize('postgres://localhost:5432/am')
const sequelize = new Sequelize('postgres://lyltfjkuixdqpr:d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2@ec2-46-137-84-173.eu-west-1.compute.amazonaws.com:5432/dekiitsc4t78r4')
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});


const User = sequelize.define('users', {

  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  company: {
    type: Sequelize.STRING,
    allowNull: false
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  customList: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    // allowNull: false
  },
  id: {
  // type: Sequelize.UUID,
  // defaultValue: Sequelize.UUIDV4, // Or Sequelize.UUIDV1,
  // primaryKey: true
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
  }
},
{

// options

});

//User.sync({ force: true }) // Now the `users` table in the database corresponds to the model definition



  // To add: deltaAmount, deltaCurrency, salesCredit

 const Axe = sequelize.define('axes', {

   traderName: {
     type: Sequelize.STRING,
     allowNull: false
   },
   currencyPair: {
     type: Sequelize.STRING,
     allowNull: false
   },
   excludeList: {
     type: Sequelize.ARRAY(Sequelize.STRING),
     // allowNull: false
   },
   product: {
     type: Sequelize.STRING,
     allowNull: false
   },
   direction: {
     type: Sequelize.STRING,
     allowNull: false
   },
   notional: {
     type: Sequelize.INTEGER,
     allowNull: false
   },
   date: {
     type: Sequelize.STRING,
     allowNull: false
   },
   strike: {
     type: Sequelize.INTEGER,
     allowNull: false
   },
   callPut: {
     type: Sequelize.STRING,
     allowNull: false
   },
   volPrice: {
     type: Sequelize.INTEGER,
     allowNull: false
   },
   spot: {
     type: Sequelize.INTEGER,
     allowNull: false
   },
   prem: {
     type: Sequelize.INTEGER,
     allowNull: false
   },
   premSettlement: {
     type: Sequelize.STRING,
     allowNull: false
   },
   userID: {
     type: Sequelize.STRING,
     allowNull: false
   },
  id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
  }
 },
 {
 // options

 });
 // Axe.sync({ force: true })



const getAxes = async (query) => {
  console.log('QQQQQ', query);
  let filterApplied = {
    where: {}
  }
  if (query.callPut) filterApplied.where.callPut = query.callPut
  if (query.product) filterApplied.where.product = query.product
  if (query.buySell) filterApplied.where.direction = query.buySell
  if (query.currencyPair) filterApplied.where.currencyPair = query.currencyPair

  const results = await Axe.findAll(filterApplied)
  // Filters	Description	Examples
  // O/N	Only O/N options i.e. 1 day options expiring next day	All options with 1 day expiry
  // Vanilla G10	Simple options, on developed currencies.  Buyer has right to exercise option on expiry date. 	USD, EUR, JPY, CAD, GBP, CHF, NOK, SEK, AUD, NZD, DKK
  // Vanilla EM	Simple options, on Emerging Market currencies. Buyer has right to exercise option on expiry date. 	TRT, ZAR, MXN, RUB, PLN, HUF, CNH, ILS, SGD, HKD, CZk, RON, and all NDF currencies (List 3 on "Curency Pairs Tab)
  // 1st Gen Exotics	Exotic options typically trigger when the currency reaches the strike price. They can have additional features such as knock-outs for example.	Digitals (DIGI), One-Touch (OT), No Touch (NT), Knock-Outs (KO), Knock-in (KI), Reverse Knock Outs(RKO), Window Knock-outs (WKO), Double Knock-Out (DKO)
  // Vol/Var	Volatility Swap (Vol swap), Variance Swap (Var swap).	1M EURUSD Vol Swap to sell at 9.5%
  // Correlation 	Correlation Options involve more than one product	Dual & Triple Digitals, Worst-Ofs.
  return results.map( a => a.dataValues)
}

const getAxe = async (axeID) => {
  // const result =  pool.query('SELECT * FROM users WHERE id = $1', [id])
  const axe = await Axe.findAll({where: {id: axeID}})
  // console.log(axe.map( a => a.dataValues)[0]);
  return axe.map( a => a.dataValues);
}

const addAxe = async (axe) => {
  // const result = pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email])
  const newAxe = new Axe(axe)
  await newAxe.save()
}

const updateAxe = async (axe) => {
  pool.query(
     'UPDATE users SET name = $1, email = $2 WHERE id = $3',
     [name, email, id])
 }

const deleteAxe = async (id) => {
  pool.query('DELETE FROM users WHERE id = $1', [id])
}

const createAccount = async (user) => {
  const uniqueEmail = await User.findAll({where: {email: user.email}})
  console.log('UE', uniqueEmail);
  // const uniqueEmail = await UserModel.findOne({email : email.toLowerCase()})
  // if (uniqueEmail && uniqueEmail.verified ) return 'Already registered';
    user.firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
    user.lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)
    await bcrypt.hash(user.password, saltRounds, function(err,hash){
      user.password = hash;
      const newUser = new User(user)
      newUser.save()
    })
    return 'Success'
}

const login = async ({email, password}) => {
  const user = await User.findAll({where: {email: email}})
  let details = user.map( u => u.dataValues)
  const same = await bcrypt.compare(password, details[0].password);
  return same ? details[0] : null
}

module.exports = {
  addAxe,
  getAxe,
  getAxes,
  createAccount,
  login
};
