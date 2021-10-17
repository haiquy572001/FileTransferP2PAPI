import { Document } from "mongoose";
import { Request } from "express";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  refresh_token?: string;
  type: string;
  _doc: object;
}

export interface INewUser {
  name: string;
  email: string;
  password: string;
}

export interface IDecodedToken {
  id?: string;
  newUser?: INewUser;
  iat: number;
  exp: number;
}

export interface IReqAuth extends Request {
  user?: IUser;
}

export interface IGgPayload {
  email: string;
  email_verified: boolean;
  name: string;
  // picture: string;
}

export interface IUserParams {
  name: string;
  email: string;
  password: string;
  type: string;
}
