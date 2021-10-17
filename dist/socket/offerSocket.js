"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offerSocket = void 0;
const offerSocket = (io, socket) => {
    socket.on("offer", (data) => {
        console.log(data);
        io.to(data.target).emit("offer", data.offer);
    });
};
exports.offerSocket = offerSocket;
