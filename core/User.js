const {ROLE} = require("../const/roles");

class User {
    #id
    #name
    #role
    #isExist

    constructor(user) {
        this.#id = user.socketId
        this.#name = user.username
        this.#role = ROLE.DWELLER
        this.#isExist = false
    }

    KickOut() {
        this.#isExist = true
    }

    setRole(role) {
        this.#role = role
    }

    getUserState() {
        return {
            id: this.#id,
            name: this.#name,
            role: this.#role,
            isExist: this.#isExist
        }
    }
}

module.exports = User