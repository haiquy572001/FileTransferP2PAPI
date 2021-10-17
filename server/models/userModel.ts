import mongoose from "mongoose";
import { IUser } from "../config/interface";

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
