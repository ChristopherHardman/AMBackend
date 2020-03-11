const Pool = require('pg').Pool
const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'am',
  password: 'password',
  port: 5432,
})

const Sequelize = require('sequelize')
const sequelize = new Sequelize('postgres://localhost:5432/am')
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
  }
},
{

// options

});

// User.sync({ force: true }) // Now the `users` table in the database corresponds to the model definition

//"dbname=dekiitsc4t78r4 host=ec2-46-137-84-173.eu-west-1.compute.amazonaws.com port=5432 user=lyltfjkuixdqpr password=d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2 sslmode=require"
// Connection URL:
 //postgres://lyltfjkuixdqpr:d5d7faecd399034e4b97eb5bdc42aba1187fcf37a41940212941a56c2f9b24e2@ec2-46-137-84-173.eu-west-1.compute.amazonaws.com:5432/dekiitsc4t78r4


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
     type: Sequelize.INTEGER,
     allowNull: false
   },
  // id: {
  // type: DataTypes.UUID,
  // defaultValue: Sequelize.UUIDV4 // Or Sequelize.UUIDV1
  // }
 },
 {

 // options


 });

 // Axe.sync({ force: true })

const getAxes = async () => {
  // const results = await pool.query('SELECT * FROM users ORDER BY id ASC')
  const results = await Axe.findAll()
  return results.map( a => a.dataValues)
}

const getAxe = async (axeID) => {
  // const result =  pool.query('SELECT * FROM users WHERE id = $1', [id])
  const axe = await Axe.findAll({where: {id: axeID}})
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


module.exports = { addAxe, getAxes };
