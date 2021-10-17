"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const { ExpressPeerServer } = require("peer");
const index_2 = require("./socket/index");
// Middleware
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// Socket
const http = require("http").createServer(app);
// const io = require("socket.io")(http);
// Routes
app.use("/api/v1", index_1.default);
// Socket server
(0, index_2.initSocket)(http);
// Create peer server
ExpressPeerServer(http, { path: "/" });
// Database;
require("./config/database");
app.use("/", (req, res) => {
    res.send("Hello");
});
// server listenning
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
