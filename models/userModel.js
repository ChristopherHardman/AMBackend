module.exports = (sequelize, Sequelize) => {
  return sequelize.define('users', {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    notifications: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },
    productPreferences: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
  })
}
