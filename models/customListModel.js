module.exports = (sequelize, Sequelize) => {
  return sequelize.define('CustomList', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    list: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
  })
}
