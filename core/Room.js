class Room {
    #room
    #isOpen
    #isLobby
    #users

    constructor(room, isOpen, isLobby, users) {
        this.#room = room
        this.#isOpen = isOpen
        this.#isLobby = isLobby
        this.#users = users
    }

    setIsOpen(isOpen) {
        if (this.#isLobby) return

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

    getRoomState() {
        return {
            id: this.#room.id,
            name: this.#room.name,
            isOpen: this.#isOpen,
            isLobby: this.#isLobby,
            usersNum: this.#users.length
        }
    }
}

module.exports = Room