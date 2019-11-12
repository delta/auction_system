'use strict';
module.exports = (sequelize, DataTypes) => {
  const AuctionSummary = sequelize.define('AuctionSummary', {
    id: {
      type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Catalogs', key: 'id' },
    },
    final_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  });
  
  AuctionSummary.associate = function(models) {
    // associations can be defined here
  };
  return AuctionSummary;
};