"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = exports.validRegister = void 0;
const validRegister = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name) {
        return res.status(400).json({ msg: "Please add your name." });
    }
    else if (name.length > 20) {
        return res.status(400).json({ msg: "Your name is up to 20 chars long." });
    }
    if (!email) {
        return res.status(400).json({ msg: "Please add your email." });
    }
    else if (!validateEmail(email)) {
        return res.status(400).json({ msg: "Email format is incorrect." });
    }
    if (password.length < 6) {
        return res.status(400).json({ msg: "Password must be at least 6 chars." });
    }
    next();
});
exports.validRegister = validRegister;
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
exports.validateEmail = validateEmail;
