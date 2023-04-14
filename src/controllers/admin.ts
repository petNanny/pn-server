import { RequestHandler } from "express";
import Admin from "../models/AdminModel";
import jwt from "jsonwebtoken";
import env from "../util/validateEnv";
import _ from "lodash";
import mongoose from "mongoose";
import createHttpError from "http-errors";

// @desc Create a new admin
// @route POST /admin/register
// @access Public
export const adminRegister: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  //check all required data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check email duplicate
  const duplicate = await Admin.findOne({ email });

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  //create petOwner
  const admin = await Admin.create({
    email,
    password,
  });

  if (admin) {
    res.status(201).json({
      email: admin.email,
    });
  } else {
    res.status(400).json({ message: "Failing to create the admin" });
  }
};

// @desc Admin login
// @route POST /admin/login
// @access Public
export const adminLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  //check all required data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check email is valid
  const foundAdmin = await Admin.findOne({ email });

  if (!foundAdmin) {
    return res.status(401).json({ message: "Account not found" });
  }

  if (!(password === foundAdmin.password)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const adminAccessToken = jwt.sign(
    {
      AdminInfo: {
        email: foundAdmin.email,
      },
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "28d" }
  );

  const adminRefreshToken = jwt.sign(
    {
      AdminInfo: {
        email: foundAdmin.email,
      },
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const currentAdmin = _.omit(foundAdmin.toObject(), ["password", "__v"]);

  //create cookie with adminRefresh token
  res.cookie("jsonWebToken", adminRefreshToken, {
    httpOnly: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //  7d
  });

  res.status(200).json({ adminAccessToken, currentAdmin });
};

// @desc Admin refresh
// @route GET /admin/refresh
// @access Public
export const adminRefreshToken: RequestHandler = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const adminRefreshToken = cookies.jwt;

  jwt.verify(adminRefreshToken, env.REFRESH_TOKEN_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const foundAdmin = await Admin.findOne({ email: decoded.AdminInfo.email });

    if (!foundAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const adminAccessToken = jwt.sign(
      {
        AdminInfo: {
          email: foundAdmin.email,
        },
      },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "5m",
      }
    );
    res.status(200).json({ adminAccessToken });
  });
};

// @desc Admin logout
// @route POST /admin/logout
// @access Public
export const adminLogout: RequestHandler = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jsonWebToken) return res.sendStatus(204);
  res.clearCookie("jsonWebToken", {
    httpOnly: true,
    sameSite: "none",
  });
  res.json({ message: "Cookie cleared" });
};

// @desc get one admin
// @route GET /admin
// @access Public
export const getAdmin: RequestHandler = async (req, res, next) => {
  const adminId = req.params.id;
  try {
    if (!adminId) {
      throw createHttpError(400, "Admin ID Required");
    }
    if (!mongoose.isValidObjectId(adminId)) {
      throw createHttpError(400, "Invalid admin id.");
    }
    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw createHttpError(400, "Admin not found");
    }

    res.status(200).json(admin);
  } catch (error) {
    next(error);
  }
};
