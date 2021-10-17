import express from "express";
import authCtrl from "../controllers/authCtrl";
import { validRegister } from "../utils/valid";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/register", validRegister, authCtrl.register);

router.post("/active", authCtrl.activeAccount);

router.post("/login", authCtrl.login);

router.get("/logout", auth, authCtrl.logout);

router.get("/refresh_token", authCtrl.refreshToken);

router.post("/login_google", authCtrl.googleLogin);

// router.post('/facebook_login', authCtrl.facebookLogin)

router.post("/forgot_password", authCtrl.forgotPassword);

router.post("/reset_password", authCtrl.resetPassword);

export default router;
