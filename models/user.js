'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
    },
    name: {
      tpye: DataTypes.STRING,
      allowNull: false
    }
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      tpye: DataTypes.STRING,
      allowNull: true
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  });
  
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};