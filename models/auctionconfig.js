'use strict';
module.exports = (sequelize, DataTypes) => {
  const AuctionConfig = sequelize.define('AuctionConfig', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    can_register: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    is_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    auction_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
  
  AuctionConfig.associate = function(models) {
    // associations can be defined here
  };
  return AuctionConfig;
};
