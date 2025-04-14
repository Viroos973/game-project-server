const User = require("../models/user.model");

const userAuthorize = async (telegramId, username) => {
    try {
        const user = await User.findOne({ where: { telegramId: telegramId } });

        if (user) {
            return {
                username: user.username
            }
        } else {
            const newUser = await User.create({
                telegramId: telegramId,
                username: username
            })

            return {
                username: newUser.username
            }
        }
    } catch (err) {
        throw {
            code: 500,
            message: err.message
        };
    }
}

const setUsername = async (telegramId, newUsername) => {
    try {
        const user = await User.findOne({ where: { telegramId: telegramId } });

        if (user) {
            await user.update({
                username: newUsername
            })
        } else {
            throw {
                code: 404,
                message: "User not found"
            };
        }
    } catch (err) {
        throw {
            code: err.code ? err.code : 500,
            message: err.message
        };
    }
}

module.exports = {
    userAuthorize,
    setUsername,
}