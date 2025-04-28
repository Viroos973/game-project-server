const Characteristics = require("../models/characteristic.model");
const ApocalypseCharacteristic = require("../models/apocalypseCharacteristic.model")
const RoomCharacteristic = require("../models/roomCharacteristic.model")

const getRandomCharacteristic = async(typeCharacteristic) => {
    try {
        const count = await Characteristics.count({
            where: {
                type: typeCharacteristic
            }
        });

        if (count > 0) {
            const random = Math.floor(Math.random() * count);
            const characteristic = await Characteristics.findOne({
                where: {
                    type: typeCharacteristic
                },
                offset: random
            })

            return {
                id: characteristic.id,
                type: characteristic.type,
                name: characteristic.name
            }
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

const getApocalypseCharacteristic = async(isGood, apocalypseId) => {
    try {
        const characteristics = await Characteristics.findAll({
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
                    id: characteristic.id,
                    type: characteristic.type
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
        const characteristics = await Characteristics.findAll({
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
                    id: characteristic.id,
                    type: characteristic.type
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