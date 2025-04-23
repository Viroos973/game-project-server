const sequelize = require('../database');

const User = require('./user.model');
const Rooms = require('./room.model');
const Characteristics = require('./characteristic.model');
const Apocalypses = require('./apocalypse.model');
const RoomCharacteristic = require('./roomCharacteristic.model');
const ApocalypseCharacteristic = require('./apocalypseCharacteristic.model');

Rooms.belongsToMany(Characteristics, {
    through: RoomCharacteristic,
    foreignKey: 'roomId',
    onDelete: 'CASCADE'
})

Apocalypses.belongsToMany(Characteristics, {
    through: ApocalypseCharacteristic,
    foreignKey: 'apocalypseId',
    onDelete: 'CASCADE'
});

Characteristics.belongsToMany(Apocalypses, {
    through: ApocalypseCharacteristic,
    foreignKey: 'characteristicId',
    onDelete: 'CASCADE'
});

Characteristics.belongsToMany(Rooms, {
    through: RoomCharacteristic,
    foreignKey: 'characteristicId',
    onDelete: 'CASCADE'
});

module.exports = {
    sequelize,
    User,
    Rooms,
    Characteristics,
    Apocalypses,
    RoomCharacteristic,
    ApocalypseCharacteristic
};