import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes/index";
const { ExpressPeerServer } = require("peer");
import { initSocket } from "./socket/index";

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// Socket
const http = require("http").createServer(app);
// const io = require("socket.io")(http);

// Routes
app.use("/api/v1", routes);

// Socket server
initSocket(http);

// Create peer server
ExpressPeerServer(http, { path: "/" });

// Database;
import "./config/database";

app.use("/", (req, res) => {
  res.send("Hello");
});

// server listenning
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
