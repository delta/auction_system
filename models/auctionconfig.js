'use strict';
module.exports = (sequelize, DataTypes) => {
    const AuctionConfig = sequelize.define('AuctionConfig', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {model: 'Users', key: 'id'}
        },
        can_register: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        is_open: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        auction_url: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        max_users: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        access_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    AuctionConfig.associate = function(models) {
        // associations can be defined here
    };
    return AuctionConfig;
};
