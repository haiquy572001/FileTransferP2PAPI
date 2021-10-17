"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.answerSocket = void 0;
const answerSocket = (io, socket) => {
    socket.on("answer", (data) => {
        console.log(data);
        io.to(data.target).emit("answer", data.answer);
    });
};
exports.answerSocket = answerSocket;
