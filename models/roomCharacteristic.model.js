const sequelize = require("../database");
const {DataTypes} = require('sequelize');

const Rooms = require('./room.model')
const Characteristics = require('./characteristic.model')

const RoomCharacteristic = sequelize.define(
    'RoomCharacteristic',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        roomId: {
            type: DataTypes.UUID,
            references: {
                model: Rooms,
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

module.exports = RoomCharacteristic