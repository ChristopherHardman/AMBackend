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
    },
    direction: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    notional: {
      type: Sequelize.INTEGER,
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
    },
    digiStrike: {
      type: Sequelize.DECIMAL,
    },
    barrierStrike: {
      type: Sequelize.DECIMAL,
    },
    callPut: {
      type: Sequelize.STRING,
    },
    payout: {
      type: Sequelize.STRING,
    },
    pricingVol: {
      type: Sequelize.DECIMAL,
    },
    KOBarrier: {
      type: Sequelize.DECIMAL,
    },
    ref: {
      type: Sequelize.STRING,
    },
    spotRef: {
      type: Sequelize.DECIMAL,
    },
    forwardRef: {
      type: Sequelize.DECIMAL,
    },
    NDFRef: {
      type: Sequelize.DECIMAL,
    },
    premium: {
      type: Sequelize.DECIMAL,
    },
    premiumCurrency: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    forwardDelta: {
      type: Sequelize.DECIMAL,
    },
    minimumTrade: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    fixingPage: {
      type: Sequelize.STRING,
    },
    ratio: {
      type: Sequelize.STRING,
    },
    pricingVol1: {
      type: Sequelize.DECIMAL,
    },
    pricingVol2: {
      type: Sequelize.DECIMAL,
    },
    putPricingVol: {
      type: Sequelize.DECIMAL,
    },
    callPricingVol: {
      type: Sequelize.DECIMAL,
    },
    strike1: {
      type: Sequelize.DECIMAL,
    },
    strike2: {
      type: Sequelize.DECIMAL,
    },
    putStrike: {
      type: Sequelize.DECIMAL,
    },
    callStrike: {
      type: Sequelize.DECIMAL,
    },
    netPremium: {
      type: Sequelize.DECIMAL,
    },
    netForwardDelta: {
      type: Sequelize.DECIMAL,
    },
    notional1: {
      type: Sequelize.INTEGER,
    },
    notional2: {
      type: Sequelize.INTEGER,
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
      type: Sequelize.ARRAY(Sequelize.STRING),
      // allowNull: false,
    },
  })
}
