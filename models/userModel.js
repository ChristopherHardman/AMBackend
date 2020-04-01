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
      defaultValue: Sequelize.UUIDV4,
    },
  })
}
