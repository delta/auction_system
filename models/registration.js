'use strict';
module.exports = (sequelize, DataTypes) => {
    const Registration = sequelize.define('Registration', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {model: 'Users', key: 'id'}
        },
        auction_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {model: 'AuctionConfigs', key: 'id'}
        }
    });

    Registration.associate = function(models) {
        // associations can be defined here
    };
    return Registration;
};
