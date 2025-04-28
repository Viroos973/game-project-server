const sequelize = require("../database");
const {DataTypes} = require("sequelize");

const Apocalypses = require('./apocalypse.model')
const Characteristics = require("./characteristic.model");

const ApocalypseCharacteristic = sequelize.define(
    'ApocalypseCharacteristic',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        apocalypseId: {
            type: DataTypes.UUID,
            references: {
                model: Apocalypses,
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
        characteristicId: {
            type: DataTypes.UUID,
            references: {
                model: Characteristics,
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
        isGood: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        timestamps: false,
    }
)

module.exports = ApocalypseCharacteristic;