class Characteristic {
    #characteristic
    #isOpen

    constructor(characteristic, isOpen) {
        this.#characteristic = characteristic;
        this.#isOpen = isOpen;
    }

    OpenOrClose() {
        this.#isOpen = !this.#isOpen;
    }

    getCharacteristicState() {
        return {
            type: this.#characteristic.type,
            name: this.#characteristic.name,
            isOpen: this.#isOpen
        }
    }
}

module.exports = Characteristic