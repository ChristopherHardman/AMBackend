const Sequelize = require('sequelize')
const dbConnect = require('../dbConnect')

beforeAll(() => {
  const sequelize = new Sequelize('postgres://localhost:5432/am')
  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err)
    })
})

afterAll(() => {
  // mongoose.disconnect()
})

test('search with no filter should return multiple axes', async () => {
  const results = await dbConnect.Axes({})
  console.log('RRRRRRRR', results)
  // const check = results.filter(
  //   (r) => r.title && r.summary && r.userFirstName && r.userLastName
  // )
  // expect(results.length).toBe(10)
  // expect(check.length).toBe(10)
})

test('search with filters returns axes matching the filters', async () => {
  // jest.setTimeout(30000);
})

test('Viewing axe returns the correct axe', async () => {
  // jest.setTimeout(30000);
})
