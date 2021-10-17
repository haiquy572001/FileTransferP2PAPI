"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomLeaveSocket = exports.roomSocket = void 0;
const MAX_ROOM_MEMBERS = 2;
const clientToRoomMap = {};
const roomSocket = (io, socket) => {
    socket.on("join-room", (roomSlug) => {
        let clients = getClients(io, roomSlug);
        if (!canConnect(clients)) {
            socket.emit("error", { message: "Room is full" });
            return;
        }
        socket.join(roomSlug);
        clientToRoomMap[socket.id] = roomSlug;
        // Getting updated room members
        clients = getClients(io, roomSlug);
        if (clients.length == MAX_ROOM_MEMBERS) {
            emitPeerJoinedEvent(io, clients);
        }
    });
};
exports.roomSocket = roomSocket;
const roomLeaveSocket = (io, socket) => {
    socket.on("disconnecting", () => {
        var _a;
        const disconnectedClientId = socket.id;
        const disconnectedClientRoom = clientToRoomMap[disconnectedClientId];
        delete clientToRoomMap[disconnectedClientId];
        const allClientsInRoom = getClients(io, disconnectedClientRoom);
        const connectedClient = (_a = allClientsInRoom.filter((value) => {
            return value !== disconnectedClientId;
        })) === null || _a === void 0 ? void 0 : _a[0];
        emitPeerLeftEvent(io, connectedClient);
    });
};
exports.roomLeaveSocket = roomLeaveSocket;
const getClients = (io, room) => {
    const clients = io.sockets.adapter.rooms.get(room) || [];
    return [...clients];
};
const canConnect = (clients) => {
    return clients.length < MAX_ROOM_MEMBERS;
};
const emitPeerJoinedEvent = (io, clients) => {
    io.to(clients[0]).emit("peer-joined", { id: clients[1], role: "peer" });
    io.to(clients[1]).emit("peer-joined", { id: clients[0], role: "creator" });
};
const emitPeerLeftEvent = (io, client) => {
    io.to(client).emit("peer-left");
};
