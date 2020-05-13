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
    product: {
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
    direction: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    notional: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    expiryDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deliveryDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    cut: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    strike: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    digiStrike: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    barrierStrike: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    callPut: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    payout: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    pricingVol: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    KOBarrier: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    spotRef: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    NDFRef: {
      type: Sequelize.DECIMAL,
      allowNull: true,
    },
    premium: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    premiumCurrency: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    forwardDelta: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    // KOStrike: {
    //   type: Sequelize.INTEGER,
    //   allowNull: true,
    // },
    minimumTrade: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    // barrier1Type: {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // },
    // barrier1: {
    //   type: Sequelize.DECIMAL,
    //   allowNull: true,
    // },
    // barrier1DateStart: {
    //   type: Sequelize.DATE,
    //   allowNull: true,
    // },
    // barrier1DateEnd: {
    //   type: Sequelize.DATE,
    //   allowNull: true,
    // },
    fixingPage: {
      type: Sequelize.STRING,
      allowNull: true,
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
