import mongoose, { Schema, Document, model, Model } from "mongoose";

interface IFileSchema extends Document {
  filename: string;
  path: string;
  size: number;
  uuid: string;
  sender?: string;
  receiver?: string;
}

const fileSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const File: Model<IFileSchema> = model("File", fileSchema);

export default File;
