module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Tracker', {
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })
}
