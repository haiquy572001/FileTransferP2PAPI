"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = exports.generateActiveToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateActiveToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, `${process.env.ACTIVE_TOKEN_SECRET}`, {
        expiresIn: "10m",
    });
};
exports.generateActiveToken = generateActiveToken;
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, {
        expiresIn: "2h",
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload, res) => {
    const refresh_token = jsonwebtoken_1.default.sign(payload, `${process.env.REFRESH_TOKEN_SECRET}`, { expiresIn: "30d" });
    res.cookie("refreshToken", refresh_token, {
        sameSite: "none",
        secure: true,
        httpOnly: true,
        path: `/api/refresh_token`,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
    });
    return refresh_token;
};
exports.generateRefreshToken = generateRefreshToken;
