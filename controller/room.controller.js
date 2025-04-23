const Room = require("../models/room.model");

const getRandomRooms = async() => {
    try {
        const count = await Room.count();
        const limit = 5;

        if (count > 0) {
            const offsets = new Set();

            while (offsets.size < Math.min(limit, count)) {
                const randomOffset = Math.floor(Math.random() * count);
                offsets.add(randomOffset);
            }

            return await Promise.all(
                [...offsets].map(offset =>
                    Room.findOne({ offset })
                )
            );
        } else {
            throw {
                code: 404,
                message: "Apocalypse not found"
            };
        }
    } catch (err) {
        throw {
            code: 500,
            message: err.message
        };
    }
}

module.exports = getRandomRooms