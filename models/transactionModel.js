module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Transactions', {
    bankCompany: {
      type: Sequelize.STRING,
    },
    bankTrader: {
      type: Sequelize.STRING,
    },
    clientCompany: {
      type: Sequelize.STRING,
    },
    clientTrader: {
      type: Sequelize.STRING,
    },
    axeID: {
      type: Sequelize.STRING,
    },
    initialRequestTime: {
      type: Sequelize.DATE
    },
    initialAmount: {
      type: Sequelize.INTEGER,
    },
    initialDelta: {
      type: Sequelize.STRING,
    },
    pricingVolChange: {
      type: Sequelize.DECIMAL,
    },
    pricingVolChangeDate: {
      type: Sequelize.DATE,
    },
    confirmTime: {
      type: Sequelize.DATE
    },
    confirmedAmount: {
      type: Sequelize.INTEGER,
    },
    forwardDate: {
      type: Sequelize.DATE
    },
    confirmedPrice: {
      type: Sequelize.DECIMAL,
    },
    optionPremium: {
      type: Sequelize.DECIMAL,
    },
    completeTime: {
      type: Sequelize.DATE
    },
    cancelledBy: {
      type: Sequelize.STRING,
    },
    cancelTime: {
      type: Sequelize.DATE,
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
  })
}
