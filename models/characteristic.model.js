const sequelize = require("../database");
const {DataTypes} = require('sequelize');

const Characteristics = sequelize.define(
    'Characteristics',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('PROFESSION', 'HEALTH', 'HOBBY', 'PHOBIA', 'EDUCATION', 'SKILL', 'AGE'),
            defaultValue: 'PROFESSION'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false,
    }
)

module.exports = Characteristics;