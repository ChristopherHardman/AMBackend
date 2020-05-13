module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Transactions', {
    bankCompany: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    bankTrader: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    clientCompany: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    clientTrader: {
      type: Sequelize.STRING,
      // allowNull: false,
    },
    axeID: {
      type: Sequelize.STRING,
      // allowNull: false
    },
    initialRequestTime: {
      type: Sequelize.DATE
      // allowNull: false
    },
    initialAmount: {
      type: Sequelize.INTEGER,
      // allowNull: false
    },
    initialDelta: {
      type: Sequelize.STRING,
      // allowNull: false
    },
    pricingVolChange: {
      type: Sequelize.DECIMAL,
      // allowNull: false
    },
    pricingVolChangeDate: {
      type: Sequelize.DATE,
      // allowNull: false
    },
    confirmTime: {
      type: Sequelize.DATE
      // allowNull: false
    },
    confirmedAmount: {
      type: Sequelize.INTEGER,
      // allowNull: false
    },
    forwardDate: {
      type: Sequelize.DATE
      // allowNull: false
    },
    confirmedPrice: {
      type: Sequelize.DECIMAL,
      // allowNull: false
    },
    optionPremium: {
      type: Sequelize.DECIMAL,
      // allowNull: false
    },
    completeTime: {
      type: Sequelize.DATE
      // allowNull: false
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
  })
}
