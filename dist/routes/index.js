"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homeRouter_1 = __importDefault(require("./homeRouter"));
const authRouter_1 = __importDefault(require("./authRouter"));
const routes = [authRouter_1.default, homeRouter_1.default];
exports.default = routes;
