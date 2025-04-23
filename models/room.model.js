const sequelize = require("../database");
const {DataTypes} = require('sequelize');

const Rooms = sequelize.define(
    'Rooms',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
)

module.exports = Rooms