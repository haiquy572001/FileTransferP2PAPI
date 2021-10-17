"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iceCandidateSocket = void 0;
const iceCandidateSocket = (io, socket) => {
    socket.on("ice-candidate", (data) => {
        console.log(data);
        io.to(data.target).emit("ice-candidate", data.candidate);
    });
};
exports.iceCandidateSocket = iceCandidateSocket;
