const {ROLE} = require("../const/roles");
const {TYPE_CHARACTERISTIC} = require("../const/typeCharacteristic");
const {getRandomCharacteristic} = require("../controller/characteristic.controller");
const Characteristic = require("./Characteristic");

class User {
    #id
    #name
    #role
    #votes
    #isVoted
    #characteristics

    constructor(user) {
        this.#id = user.socketId
        this.#name = user.username
        this.#role = ROLE.DWELLER
        this.#characteristics = []
        this.#votes = 0
        this.#isVoted = false
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

    setIsVoted(isVoted) {
        this.#isVoted = isVoted;
    }

    getIsVoted() {
        return this.#isVoted;
    }

    getVotes() {
        return this.#votes;
    }

    vote() {
        this.#votes += 1;
    }

    resetVotes() {
        this.#votes = 0;
    }

    setRole(role) {
        this.#role = role
    }

    getUserState() {
        return {
            id: this.#id,
            name: this.#name,
            role: this.#role,
            characteristics: this.#characteristics.map(characteristic => characteristic.getCharacteristicState()),
            isVoted: this.#isVoted
        }
    }
}

module.exports = User