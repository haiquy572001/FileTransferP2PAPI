"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fileSchema = new mongoose_1.Schema({
    filename: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: false,
    },
    receiver: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});
const File = (0, mongoose_1.model)("File", fileSchema);
exports.default = File;
