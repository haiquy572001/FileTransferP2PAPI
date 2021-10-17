import { Request, Response } from "express";
import Users from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  generateActiveToken,
  generateAccessToken,
  generateRefreshToken,
} from "../config/generateToken";
import sendMail from "../config/sendEmail";
import { validateEmail } from "../utils/valid";
import {
  IDecodedToken,
  IUser,
  IReqAuth,
  IGgPayload,
  IUserParams,
} from "../config/interface";

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(`${process.env.MAIL_CLIENT_ID}`);
const CLIENT_URL = `${process.env.BASE_URL}`;

const authCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      const user = await Users.findOne({ email });
      if (user) return res.status(400).json({ msg: "Email already exists." });

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = { name, email, password: passwordHash };

      const active_token = generateActiveToken({ newUser });

      const url = `${CLIENT_URL}/active/${active_token}`;

      if (validateEmail(email)) {
        sendMail(email, url, "Verify your email address");
        return res.json({ msg: "Success! Please check your email." });
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.response.message });
    }
  },

  activeAccount: async (req: Request, res: Response) => {
    try {
      const { active_token } = req.body;

      const decoded = <IDecodedToken>(
        jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)
      );

      const { newUser } = decoded;

      if (!newUser)
        return res.status(400).json({ msg: "Invalid authentication." });

      const user = await Users.findOne({ email: newUser.email });
      if (user) return res.status(400).json({ msg: "Email already exists." });

      const new_user = new Users(newUser);

      await new_user.save();

      res.json({ msg: "Account has been activated!" });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email does not exits." });

      // if user exists
      loginUser(user, password, res);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  logout: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res.status(400).json({ msg: "Invalid Authentication." });

    try {
      res.clearCookie("refreshToken", { path: `/api/refresh_token` });

      await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          rf_token: "",
        }
      );

      return res.json({ msg: "Logged out!" });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const rf_token = req.cookies.refreshToken;
      console.log(req.cookies);
      if (!rf_token) return res.status(400).json({ msg: "Please login now!" });

      const decoded = <IDecodedToken>(
        jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`)
      );
      if (!decoded.id)
        return res.status(400).json({ msg: "Please login now!" });

      const user = await Users.findById(decoded.id).select(
        "-password +refresh_token"
      );
      if (!user)
        return res.status(400).json({ msg: "This account does not exist." });

      if (rf_token !== user.refresh_token)
        return res.status(400).json({ msg: "Please login now!" });

      const access_token = generateAccessToken({ id: user._id });
      const refresh_token = generateRefreshToken({ id: user._id }, res);

      await Users.findOneAndUpdate(
        { _id: user._id },
        {
          refresh_token: refresh_token,
        }
      );

      res.json({ access_token, user });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  googleLogin: async (req: Request, res: Response) => {
    try {
      const { id_token } = req.body;
      const verify = await client.verifyIdToken({
        idToken: id_token,
        audience: `${process.env.MAIL_CLIENT_ID}`,
      });

      const { email, email_verified, name } = <IGgPayload>verify.getPayload();

      if (!email_verified)
        return res.status(500).json({ msg: "Email verification failed." });

      const password = email + "your google secrect password";
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await Users.findOne({ email: email });

      if (user) {
        loginUser(user, password, res);
      } else {
        const user = {
          name,
          email: email,
          password: passwordHash,
          type: "google",
        };
        registerUser(user, res);
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await Users.findOne({ email });
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      if (user.type !== "register")
        return res.status(400).json({
          msg: `Login ${user.type} can't use this function.`,
        });

      const access_token = generateAccessToken({ id: user._id });

      const url = `${CLIENT_URL}/reset_password/${access_token}`;

      if (validateEmail(email)) {
        sendMail(email, url, "Forgot password?");
        return res.json({ msg: "Success! Please check your email." });
      }
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, new_password, confirm_new_password } = req.body;
      const decoded = <IDecodedToken>(
        jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`)
      );

      const user = await Users.findOne({ _id: decoded.id });
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

      const passwordHash = await bcrypt.hash(new_password, 12);

      await Users.findOneAndUpdate(
        { _id: user._id },
        {
          password: passwordHash,
        }
      );
      res.json({ msg: "Reset Password Success!" });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

const loginUser = async (user: IUser, password: string, res: Response) => {
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    let msgError =
      user.type === "register"
        ? "Password is incorrect."
        : `Password is incorrect. This account login with ${user.type}`;

    return res.status(400).json({ msg: msgError });
  }

  const access_token = generateAccessToken({ id: user._id });
  const refresh_token = generateRefreshToken({ id: user._id }, res);

  await Users.findOneAndUpdate(
    { _id: user._id },
    {
      refresh_token: refresh_token,
    }
  );

  res.json({
    msg: "Login Success!",
    access_token,
    user: { ...user._doc, password: "" },
  });
};

const registerUser = async (user: IUserParams, res: Response) => {
  const newUser = new Users(user);

  const access_token = generateAccessToken({ id: newUser._id });
  const refresh_token = generateRefreshToken({ id: newUser._id }, res);

  newUser.refresh_token = refresh_token;
  await newUser.save();

  res.json({
    msg: "Login Success!",
    access_token,
    user: { ...newUser._doc, password: "" },
  });
};

export default authCtrl;
