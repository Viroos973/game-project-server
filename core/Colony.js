const {v4: uuidV4} = require('uuid');
const Room = require("./Room");
const User = require("./User");

class Colony {
    #apocalypse
    #rooms
    #users

    constructor(apocalypse, users, lobbyId) {
        this.#apocalypse = apocalypse;
        this.#users = users.map((user) => new User(user))
        this.#rooms = this.#createRooms(users, lobbyId)
    }

    #createRooms(users, lobbyId) {
        const rooms = []
        const lobby = new Room({ name: "lobby", id: lobbyId }, true, true, this.#users)

        rooms.push(lobby)

        for (let i = 0; i < 5; i++) {
            const randomIsOpen = Math.random() < 0.5;
            const room = {
                name: "room",
                id: uuidV4()
            }

            rooms.push(new Room(room, randomIsOpen, false, []));
        }

        return rooms;
    }

    getUser(userId) {
        for (const user of this.#users) {
            const userState = user.getUserState()

            if (userState.id === userId) {
                return user
            }
        }

        return null;
    }

    getRoom(roomId) {
        for (const room of this.#rooms) {
            const roomState = room.getRoomState()

            if (roomState.id === roomId) {
                return room
            }
        }

        return null
    }

    getStateColony() {
        return {
            apocalypse: this.#apocalypse.name,
            descriptionApocalypse: this.#apocalypse.description,
            rooms: this.#rooms.map((room) => room.getRoomState())
        }
    }
}

module.exports = Colony