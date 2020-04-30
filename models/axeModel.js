module.exports = (sequelize, Sequelize) => {
  return sequelize.define('Axes', {
    traderName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    company: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    currencyPair: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    excludeList: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      // allowNull: false
    },
    product: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    direction: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    notional: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    strike: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    callPut: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    volPrice: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    spot: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    premium: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    premiumCurrency: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cut: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    delta: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    KOStrike: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    minimumTrade: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userID: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    capacity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tradeStatus: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    views: {
      type: Sequelize.INTEGER,
      // allowNull: false,
    },
  })
}
