const Characteristic = require("../models/characteristic.model");
const ApocalypseCharacteristic = require("../models/apocalypseCharacteristic.model")
const RoomCharacteristic = require("../models/roomCharacteristic.model")

const getRandomCharacteristic = async(typeCharacteristic) => {
    try {
        const count = await Characteristic.count({
            where: {
                type: typeCharacteristic
            }
        });

        if (count > 0) {
            const random = Math.floor(Math.random() * count);
            return await Characteristic.findOne({
                where: {
                    type: typeCharacteristic
                },
                offset: random
            })
        } else {
            throw {
                code: 404,
                message: "Apocalypse not found"
            };
        }
    } catch (err) {
        throw {
            code: 500,
            message: err.message
        };
    }
}

const getApocalypseCharacteristic = async(isGood, apocalypseId) => {
    try {
        const characteristics = await Characteristic.findAll({
            include: [{
                model: ApocalypseCharacteristic,
                where: {
                    apocalypseId: apocalypseId,
                    isGood: isGood
                },
                attributes: []
            }]
        });

        if (characteristics.length > 0) {
            return characteristics.map(characteristic => {
                return {
                    type: characteristic.type,
                    name: characteristic.name
                }
            })
        } else {
            throw {
                code: 404,
                message: "Characteristic not found"
            };
        }
    } catch (err) {
        throw {
            code: 500,
            message: err.message
        };
    }
}

const getRoomCharacteristic = async(isGood, roomId) => {
    try {
        const characteristics = await Characteristic.findAll({
            include: [{
                model: RoomCharacteristic,
                where: {
                    roomId: roomId,
                    isGood: isGood
                },
                attributes: []
            }]
        });

        if (characteristics.length > 0) {
            return characteristics.map(characteristic => {
                return {
                    type: characteristic.type,
                    name: characteristic.name
                }
            })
        } else {
            throw {
                code: 404,
                message: "Characteristic not found"
            };
        }
    } catch (err) {
        throw {
            code: 500,
            message: err.message
        };
    }
}

module.exports = {
    getRandomCharacteristic,
    getRoomCharacteristic,
    getApocalypseCharacteristic
}