const sequelize = require( '../database');
const {DataTypes} = require('sequelize');

const User = sequelize.define(
    'User',
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        telegramId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
    }
)

module.exports = User