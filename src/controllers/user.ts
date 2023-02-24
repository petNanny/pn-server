import createHttpError from "http-errors";
import mongoose from "mongoose";
import { RequestHandler } from "express";
import User from "../models/PetSitterModel";

//get all users
export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await User.find().exec();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

//get one users
export const getUser: RequestHandler = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw createHttpError(400, "Invalid user id");
    }
    const user = await User.findById(userId).exec();

    if (!user) {
      throw createHttpError(404, "User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc Logout
// @route POST /users/logout
// @access Public
export const logout: RequestHandler = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
  });
  res.json({ message: "Cookie cleared" });
};
