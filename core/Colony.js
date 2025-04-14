const {v4: uuidV4} = require('uuid');
const Room = require("./Room");

class Colony {
    #apocalypse
    #descriptionApocalypse
    #rooms

    constructor(apocalypse, descriptionApocalypse, users, lobbyId) {
        this.#apocalypse = apocalypse;
        this.#descriptionApocalypse = descriptionApocalypse;
        this.#rooms = this.#createRooms(users, lobbyId)
    }

    #createRooms(users, lobbyId) {
        const rooms = []
        const lobby = new Room("lobby", true, true, users, lobbyId)

        rooms.push(lobby)

        for (let i = 0; i < 5; i++) {
            const randomIsOpen = Math.random() < 0.5;
            const roomId = uuidV4()

            rooms.push(new Room("room", randomIsOpen, false, [], roomId));
        }

        return rooms;
    }

    getUser(userId) {
        for (const room of this.#rooms) {
            const users = room.getUsers()

            for (const user of users) {
                const userState = user.getUserState()

                if (userState.id === userId) {
                    return user
                }
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
            apocalypse: this.#apocalypse,
            descriptionApocalypse: this.#descriptionApocalypse,
            rooms: this.#rooms.map((room) => room.getRoomState())
        }
    }
}

module.exports = Colony