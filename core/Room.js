class Room {
    #voiceId
    #room
    #isOpen
    #isLobby
    #users

    constructor(voiceId, room, isOpen, isLobby, users) {
        this.#voiceId = voiceId;
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
            id: this.#voiceId,
            name: this.#room.name,
            isOpen: this.#isOpen,
            isLobby: this.#isLobby,
            usersNum: this.#users.length
        }
    }
}

module.exports = Room