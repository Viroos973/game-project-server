const Apocalypse = require("../models/apocalypse.model");

const getRandomApocalypse = async() => {
    try {
        const count = await Apocalypse.count();

        if (count > 0) {
            const random = Math.floor(Math.random() * count);
            return await Apocalypse.findOne({
                offset: random
            })
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

module.exports = getRandomApocalypse