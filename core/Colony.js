const {v4: uuidV4} = require('uuid');
const Room = require("./Room");
const User = require("./User");
const getRandomRooms = require("../controller/room.controller");

class Colony {
    #apocalypse
    #rooms
    #users

    constructor(apocalypse) {
        this.#apocalypse = apocalypse;
        this.#users = []
        this.#rooms = []
    }

    async createRooms(lobbyId) {
        try {
            const rooms = []

            const lobby = new Room(lobbyId, { id: null, name: "Лобби" }, true, true, this.#users)
            rooms.push(lobby)

            const typeRooms = await getRandomRooms()
            for (const room of typeRooms) {
                const randomIsOpen = Math.random() < 0.5;
                const voiceId = uuidV4();
                rooms.push(new Room(voiceId, room, randomIsOpen, false, []));
            }

            this.#rooms = rooms;
        } catch (e) {
            console.error("Room creation error: " + e.message)
        }
    }

    async createUsers(users) {
        try {
            const userPromises = users.map(async (item) => {
                const user = new User(item);
                await user.createCharacteristic();
                return user;
            });
            this.#users = await Promise.all(userPromises);
        } catch (e) {
            console.error("User creation error: " + e.message)
        }
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
            rooms: this.#rooms.map((room) => room.getRoomState()),
            users: this.#users.map((user) => user.getUserState())
        }
    }
}

module.exports = Colony