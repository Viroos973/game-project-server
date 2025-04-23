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
            characteristic: this.#characteristic,
            isOpen: this.#isOpen
        }
    }
}