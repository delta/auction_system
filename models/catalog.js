'use strict';
module.exports = (sequelize, DataTypes) => {
    const Catalog = sequelize.define('Catalog', {
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
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        base_price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        for_sale: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        thumbnail_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    Catalog.associate = function(models) {
        // associations can be defined here
    };
    return Catalog;
};
