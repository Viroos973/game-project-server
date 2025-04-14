const User = require("./User");

class Room {
    #id
    #name
    #isOpen
    #isLobby
    #users

    constructor(name, isOpen, isLobby, users, id) {
        this.#id = id
        this.#name = name
        this.#isOpen = isOpen
        this.#isLobby = isLobby
        this.#users = users.map((user) => new User(user))
    }

    setIsOpen(isOpen) {
        this.#isOpen = isOpen
    }

    getIsOpen() {
        return this.#isOpen
    }

    addUser(user) {
        if (!this.#isOpen) return

        this.#users.push(user)
    }

    deleteUser(userId) {
        this.#users = this.#users.filter(user => user.getUserState().id !== userId);
    }

    getUsers() {
        return this.#users;
    }

    getRoomState() {
        return {
            id: this.#id,
            name: this.#name,
            isOpen: this.#isOpen,
            isLobby: this.#isLobby,
            usersNum: this.#users.length
        }
    }
}

module.exports = Room