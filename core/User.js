const {ROLE} = require("../const/roles");

class User {
    #id
    #name
    #role

    constructor(user) {
        this.#id = user.socketId
        this.#name = user.username
        this.#role = ROLE.DWELLER
    }

    setRole(role) {
        this.#role = role
    }

    getUserState() {
        return {
            id: this.#id,
            name: this.#name,
            role: this.#role
        }
    }
}

module.exports = User