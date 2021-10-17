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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken_1 = require("../config/generateToken");
const sendEmail_1 = __importDefault(require("../config/sendEmail"));
const valid_1 = require("../utils/valid");
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(`${process.env.MAIL_CLIENT_ID}`);
const CLIENT_URL = `${process.env.BASE_URL}`;
const authCtrl = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, email, password } = req.body;
            const user = yield userModel_1.default.findOne({ email });
            if (user)
                return res.status(400).json({ msg: "Email already exists." });
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const newUser = { name, email, password: passwordHash };
            const active_token = (0, generateToken_1.generateActiveToken)({ newUser });
            const url = `${CLIENT_URL}/active/${active_token}`;
            if ((0, valid_1.validateEmail)(email)) {
                (0, sendEmail_1.default)(email, url, "Verify your email address");
                return res.json({ msg: "Success! Please check your email." });
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.response.message });
        }
    }),
    activeAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { active_token } = req.body;
            const decoded = (jsonwebtoken_1.default.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`));
            const { newUser } = decoded;
            if (!newUser)
                return res.status(400).json({ msg: "Invalid authentication." });
            const user = yield userModel_1.default.findOne({ email: newUser.email });
            if (user)
                return res.status(400).json({ msg: "Email already exists." });
            const new_user = new userModel_1.default(newUser);
            yield new_user.save();
            res.json({ msg: "Account has been activated!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield userModel_1.default.findOne({ email });
            if (!user)
                return res.status(400).json({ msg: "This email does not exits." });
            // if user exists
            loginUser(user, password, res);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    logout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication." });
        try {
            res.clearCookie("refreshToken", { path: `/api/refresh_token` });
            yield userModel_1.default.findOneAndUpdate({ _id: req.user._id }, {
                rf_token: "",
            });
            return res.json({ msg: "Logged out!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    refreshToken: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const rf_token = req.cookies.refreshToken;
            console.log(req.cookies);
            if (!rf_token)
                return res.status(400).json({ msg: "Please login now!" });
            const decoded = (jsonwebtoken_1.default.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`));
            if (!decoded.id)
                return res.status(400).json({ msg: "Please login now!" });
            const user = yield userModel_1.default.findById(decoded.id).select("-password +refresh_token");
            if (!user)
                return res.status(400).json({ msg: "This account does not exist." });
            if (rf_token !== user.refresh_token)
                return res.status(400).json({ msg: "Please login now!" });
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id }, res);
            yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
                refresh_token: refresh_token,
            });
            res.json({ access_token, user });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    googleLogin: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id_token } = req.body;
            const verify = yield client.verifyIdToken({
                idToken: id_token,
                audience: `${process.env.MAIL_CLIENT_ID}`,
            });
            const { email, email_verified, name } = verify.getPayload();
            if (!email_verified)
                return res.status(500).json({ msg: "Email verification failed." });
            const password = email + "your google secrect password";
            const passwordHash = yield bcrypt_1.default.hash(password, 12);
            const user = yield userModel_1.default.findOne({ email: email });
            if (user) {
                loginUser(user, password, res);
            }
            else {
                const user = {
                    name,
                    email: email,
                    password: passwordHash,
                    type: "google",
                };
                registerUser(user, res);
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    forgotPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            const user = yield userModel_1.default.findOne({ email });
            if (!user)
                return res.status(400).json({ msg: "This email does not exist." });
            if (user.type !== "register")
                return res.status(400).json({
                    msg: `Login ${user.type} can't use this function.`,
                });
            const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
            const url = `${CLIENT_URL}/reset_password/${access_token}`;
            if ((0, valid_1.validateEmail)(email)) {
                (0, sendEmail_1.default)(email, url, "Forgot password?");
                return res.json({ msg: "Success! Please check your email." });
            }
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    resetPassword: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { token, new_password, confirm_new_password } = req.body;
            const decoded = (jsonwebtoken_1.default.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`));
            const user = yield userModel_1.default.findOne({ _id: decoded.id });
            if (!user)
                return res.status(400).json({ msg: "Invalid authentication." });
            if (new_password.length < 6) {
                return res
                    .status(400)
                    .json({ msg: "Password must be at least 6 characters" });
            }
            if (new_password !== confirm_new_password) {
                return res.status(400).json({ msg: "Confirm password not correct" });
            }
            const passwordHash = yield bcrypt_1.default.hash(new_password, 12);
            yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
                password: passwordHash,
            });
            res.json({ msg: "Reset Password Success!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
};
const loginUser = (user, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        let msgError = user.type === "register"
            ? "Password is incorrect."
            : `Password is incorrect. This account login with ${user.type}`;
        return res.status(400).json({ msg: msgError });
    }
    const access_token = (0, generateToken_1.generateAccessToken)({ id: user._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: user._id }, res);
    yield userModel_1.default.findOneAndUpdate({ _id: user._id }, {
        refresh_token: refresh_token,
    });
    res.json({
        msg: "Login Success!",
        access_token,
        user: Object.assign(Object.assign({}, user._doc), { password: "" }),
    });
});
const registerUser = (user, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new userModel_1.default(user);
    const access_token = (0, generateToken_1.generateAccessToken)({ id: newUser._id });
    const refresh_token = (0, generateToken_1.generateRefreshToken)({ id: newUser._id }, res);
    newUser.refresh_token = refresh_token;
    yield newUser.save();
    res.json({
        msg: "Login Success!",
        access_token,
        user: Object.assign(Object.assign({}, newUser._doc), { password: "" }),
    });
});
exports.default = authCtrl;
