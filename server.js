const express = require('express');
const {userAuthorize, setUsername} = require("./controller/user.controller");
const app = express();
const server = require('http').createServer(app);
const {sequelize} = require( './models/index');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const Colony = require("./core/Colony");
const {v4: uuidV4} = require('uuid');
const getRandomApocalypse = require("./controller/apocalypse.controller");
const {ROLE} = require("./const/roles");

const port = process.env.PORT || 3001;
const botToken = '7617931336:AAGUCDHAvEqflVhuNcFXXglQdeB6mG022x0';

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

function getStateForUser(colony, userSocket) {
    const stateColony = colony.getStateColony();

    return {
        ...stateColony,
        users: stateColony.users.map(userState =>
            userState.id === userSocket.id
                ? userState
                : {
                    ...userState,
                    characteristics: userState.characteristics.map(ch =>
                        !ch.isOpen
                            ? { ...ch, name: "Скрыто" }
                            : ch
                    )
                }
        )
    };
}

function endVoting(users, socket) {
    io.to(socket.gameRoom).emit('stop-activity');

    let leaders = [];
    let maxVotes = -1;
    let leader;

    for (const user of users) {
        user.setRole(ROLE.DWELLER)

        if (maxVotes < user.getVotes()) {
            maxVotes = user.getVotes()
            leaders = [user]
        } else if (maxVotes === user.getVotes()) {
            leaders.push(user)
        }

        user.resetVotes()
    }

    if (leaders.length === 1) {
        leader = leaders[0];
    } else if (leaders.length > 1) {
        leader = leaders[Math.floor(Math.random() * leaders.length)];
    }

    leader.setRole(ROLE.LEADER)

    const players = getUsersInRoom(socket.gameRoom)
    players.forEach(player => {
        const userSocket = io.sockets.sockets.get(player.socketId);
        if (userSocket) {
            userSocket.emit('set-state-colony', getStateForUser(socket.colony, userSocket))
        }
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
        origin: "https://ml7rda-95-191-10-201.ru.tuna.am",
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

                const players = getUsersInRoom(socket.gameRoom)
                players.forEach(player => {
                    const userSocket = io.sockets.sockets.get(player.socketId);
                    if (userSocket) {
                        userSocket.emit('set-state-colony', getStateForUser(socket.colony, userSocket))
                    }
                });
                room = newRoomId
            })

            socket.on('leave', () => {
                leaveRoom(socket, room)
            });

            socket.on('move-all-to-lobby', () => {
                const colony = socket.colony;
                const lobbyState = colony.getLobbyState();

                colony.moveAllToLobby()

                leaveRoom(socket, room);
                joinRoom(socket, lobbyState.id);

                socket.emit('set-state-colony', getStateForUser(colony, socket));
                room = lobbyState.id;
            })

            socket.on('activate-voting', () => {
                socket.emit('restart-timer', 2, true)
            })

            socket.on('vote', (userId) => {
                const thisPlayer = socket.colony.getUser(socket.id);
                if (thisPlayer.getIsVoted()) return;

                const player = socket.colony.getUser(userId);
                player.vote();

                thisPlayer.setIsVoted(true);

                const users = socket.colony.getUsers();
                if (users.every(player => player.getIsVoted())) {
                    endVoting(users, socket)
                }
            })

            socket.on('end-voting', () => {
                const players = getUsersInRoom(socket.gameRoom)
                const users = socket.colony.getUsers();

                if (socket.id === players[0].socketId) {
                    endVoting(users, socket)
                }
            })

            socket.on('create-game', async () => {
                io.to(room).emit('start-game');

                const gameRoom = uuidV4()
                const users = getUsersInRoom(room)
                const apocalypse = await getRandomApocalypse()

                const colony = new Colony(apocalypse);
                await colony.createUsers(users)
                await colony.createRooms(room)

                users.forEach(user => {
                    const userSocket = io.sockets.sockets.get(user.socketId);
                    if (userSocket) {
                        userSocket.join(gameRoom);
                        userSocket.gameRoom = gameRoom;
                        userSocket.colony = colony;

                        userSocket.emit('set-state-colony', getStateForUser(colony, userSocket))
                    }
                });
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