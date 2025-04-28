const {ROLE} = require("../const/roles");
const {TYPE_CHARACTERISTIC} = require("../const/typeCharacteristic");
const {getRandomCharacteristic} = require("../controller/characteristic.controller");
const Characteristic = require("./Characteristic");

class User {
    #id
    #name
    #role
    #characteristics

    constructor(user) {
        this.#id = user.socketId
        this.#name = user.username
        this.#role = ROLE.DWELLER
        this.#characteristics = []
    }

    async createCharacteristic() {
        try {
            const characteristics = []

            const characteristicTypes = Object.values(TYPE_CHARACTERISTIC)
            for (const type of characteristicTypes) {
                const typeCharacteristic = await getRandomCharacteristic(type)
                const characteristic = new Characteristic(typeCharacteristic, type === "PROFESSION")
                characteristics.push(characteristic)
            }

            this.#characteristics = characteristics
        } catch (error) {
            throw error
        }
    }

    setRole(role) {
        this.#role = role
    }

    getUserState() {
        return {
            id: this.#id,
            name: this.#name,
            role: this.#role,
            characteristics: this.#characteristics.map(characteristic => characteristic.getCharacteristicState())
        }
    }
}

module.exports = User