"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
        trim: true,
        maxlength: [20, "Your name is up to 20 chars long."],
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please add your password"],
        trim: true,
        minlength: [6, "Password must be at least 6 characters"],
    },
    refresh_token: { type: String, select: false },
    type: {
        type: String,
        default: "register", // login
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("User", userSchema);
