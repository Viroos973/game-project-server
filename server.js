const express = require('express');
const {userAuthorize, setUsername} = require("./controller/user.controller");
const app = express();
const server = require('http').createServer(app);
const {sequelize} = require( './models/index');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const Colony = require("./core/Colony");
const {v4: uuidV4} = require('uuid');

const port = process.env.PORT || 3001;
const botToken = '7796741487:AAGnjAdgirV00MJ15YWupb3Dg4X7x4R0rE0';

function getUsersInRoom(roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];

    const clients = Array.from(room);

    return clients.map(socketId => {
        const s = io.sockets.sockets.get(socketId);
        return {
            username: s.username || 'Anonymous',
            socketId: socketId
        };
    });
}

function authorize(result, socket, roomId) {
    const users = getUsersInRoom(roomId)
    const userSocket = io.sockets.sockets.get(users[0]?.socketId)
    if (userSocket && userSocket.colony) {
        socket.emit('already-game-started');
        return;
    }

    const {rooms: joinedRooms} = socket;
    if (Array.from(joinedRooms).includes(roomId)) return;

    socket.username = result.username;
    const token = jwt.sign({ userId: socket.id }, "SDFTGYTDRFTY")

    socket.emit('set-token', token);
    socket.emit('start-join-into-voice');
}

function leaveRoom(socket, roomID) {
    const clients = getUsersInRoom(roomID)

    clients.forEach(client => {
        if (client.socketId === socket.id) return

        io.to(client.socketId).emit('remove-peer', {
            peerID: socket.id,
        });

        socket.emit('remove-peer', {
            peerID: client.socketId,
        });
    });

    socket.leave(roomID);
    io.to(roomID).emit('get-clients', clients);
}

function joinRoom(socket, roomId) {
    socket.join(roomId);
    const users = getUsersInRoom(roomId)

    users.forEach(client => {
        if (client.socketId === socket.id) return

        io.to(client.socketId).emit('add-peer', {
            peerID: socket.id,
            createOffer: false
        });

        socket.emit('add-peer', {
            peerID: client.socketId,
            createOffer: true
        });
    });

    io.to(roomId).emit('get-clients', users);
}

const io = require("socket.io")(server, {
    cors: {
        origin: "https://gsudta-95-191-10-201.ru.tuna.am",
        methods: ["GET", "POST"],
    },
})

io.on('connection', socket => {
    let room = ""

    socket.on("validation-and-join", (initData, roomId) => {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get("hash");
        room = roomId

        urlParams.delete("hash");
        urlParams.sort();

        let dataCheckString = "";
        for(const [key, value] of urlParams.entries()){
            dataCheckString += key+'='+value+'\n';
        }
        dataCheckString = dataCheckString.slice(0, -1);

        const secretKey = crypto.createHmac('sha256', "WebAppData").update(botToken).digest();
        const checkHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (hash === checkHash) {
            const userJson = urlParams.get('user');
            const user = JSON.parse(userJson);
            const id = user.id;
            const username = user.username;
            const firstName = user.first_name;
            const lastName = user.last_name;

            if (username && username !== "") {
                userAuthorize(id, username)
                    .then(result => {
                        authorize(result, socket, roomId)
                    }).catch(err => console.log(err));
            } else {
                userAuthorize(id, firstName + " " + lastName)
                    .then(result => {
                        authorize(result, socket, roomId)
                    }).catch(err => console.log(err));
            }

            socket.on("set-username", username => {
                setUsername(id, username)
                    .then(() => {
                        socket.username = username;

                        const users = getUsersInRoom(roomId)
                        io.to(roomId).emit('get-clients', users);
                    }).catch(err => console.log(err));
            })

            socket.on('join-into-voice', () => {
                joinRoom(socket, roomId);
            })

            socket.on('relay-sdp', ({peerID, sessionDescription}) => {
                io.to(peerID).emit('session-description', {
                    peerID: socket.id,
                    sessionDescription,
                });
            });

            socket.on('relay-ice', ({peerID, iceCandidate}) => {
                io.to(peerID).emit('ice-candidate', {
                    peerID: socket.id,
                    iceCandidate,
                });
            });

            socket.on('set-room', (newRoomId) => {
                if (!socket.colony) return

                const newRoom = socket.colony.getRoom(newRoomId)

                if (!newRoom.getIsOpen()) return

                const oldRoom = socket.colony.getRoom(room)
                const player = socket.colony.getUser(socket.id);

                oldRoom.deleteUser(socket.id)
                newRoom.addUser(player)

                leaveRoom(socket, room)
                joinRoom(socket, newRoomId)

                io.to(socket.gameRoom).emit('set-state-colony', socket.colony.getStateColony());
                room = newRoomId
            })

            socket.on('leave', () => {
                leaveRoom(socket, room)
            });

            socket.on('create-game', () => {
                io.to(room).emit('start-game');

                const gameRoom = uuidV4()
                const users = getUsersInRoom(room)
                const apocalypse = {
                    name: "Грибной",
                    description: "Очень страшный апокалипсис"
                }
                const colony = new Colony(apocalypse, users, room);

                users.forEach(user => {
                    const userSocket = io.sockets.sockets.get(user.socketId);
                    if (userSocket) {
                        userSocket.join(gameRoom);
                        userSocket.gameRoom = gameRoom;
                        userSocket.colony = colony;
                    }
                });

                io.to(room).emit('set-state-colony', colony.getStateColony());
            })
        } else {
            console.log("verification failed");
            socket.disconnect();
        }
    })

    socket.on("send-key", (roomId) => {
        const rooms = io.sockets.adapter.rooms

        if (rooms.has(roomId) && Array.from(rooms.get(roomId)).length <= 15) {
            socket.emit("join-with-key", true, roomId)
        } else {
            socket.emit("join-with-key", false, null)
        }
    })

    socket.on('disconnect', () => {
        if (room !== "") {
            leaveRoom(socket, room)
            room = ""
        }
    });
});

const startServer = async () => {
    try {
        await sequelize.sync();
        console.log('Database synchronized');

        server.listen(port, () => {
            console.log(`Socket.IO server started on port: ${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();