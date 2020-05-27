module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Company', {
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    customLists: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },
    staff: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },
    clients: {
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
