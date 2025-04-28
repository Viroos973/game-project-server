const Room = require("../models/room.model");

const getRandomRooms = async() => {
    try {
        const count = await Room.count();
        const limit = 4;

        const offsets = Array.from({ length: Math.min(limit, count) }, () =>
            Math.floor(Math.random() * count)
        );

        const rooms = await Promise.all(
            offsets.map(offset =>
                Room.findOne({ offset })
            )
        );

        return rooms.map(room => {
            return {
                typeId: room.id,
                name: room.name
            }
        })
    } catch (err) {
        throw {
            code: 500,
            message: err.message
        };
    }
}

module.exports = getRandomRooms