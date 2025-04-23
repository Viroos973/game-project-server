const sequelize = require("../database");
const {DataTypes} = require('sequelize');

const Apocalypses = sequelize.define(
    'Apocalypses',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }
)

module.exports = Apocalypses;