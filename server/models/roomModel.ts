import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add name room"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add password"],
      trim: true,
    },
    users: [{ type: mongoose.Types.ObjectId, ref: "users" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Rooms", roomSchema);
