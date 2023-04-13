import { RequestHandler } from "express";
import PetOwner from "../models/PetOwnerModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../util/validateEnv";
import _ from "lodash";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { OAuth2Client, TokenPayload } from "google-auth-library";
// @desc Create new pet Owner
// @route POST /auth/register
// @access Public
export const register: RequestHandler = async (req, res) => {
  const { email, firstName, lastName, userName, password, avatar, phone } = req.body;

  //check all required data
  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check email duplicate
  const duplicate = await PetOwner.findOne({ email });

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate email" });
  }

  //hash password
  const hashedPwd = await bcrypt.hash(password, 10);

  //create petOwner
  const petOwner = await PetOwner.create({
    email,
    firstName,
    lastName,
    userName,
    password: hashedPwd,
    avatar,
    phone,
  });

  // send verification email
  const token = jwt.sign({ email }, env.JWT_KEY, { expiresIn: "1d" });
  const userId = petOwner._id;
  const link = env.EMAIL_VERIFY_LINK + `${userId}/${token}/`;
  const transporter = nodemailer.createTransport({
    service: env.EMAIL_SERVICE,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: "petnannyau@gmail.com",
    to: `${email}`,
    subject: "Email confirmation",
    html: `Press <a href=${link}>here</a> to verify your email.`,
  };
  await transporter.sendMail(mailOptions, function (error) {
    if (error) {
      return res.status(404).json({ error: "failed to send email" });
    }
  });

  if (petOwner) {
    res.status(201).json({
      _id: petOwner._id,
      firstName: petOwner.firstName,
      lastName: petOwner.lastName,
      userName: petOwner.userName,
      email: petOwner.email,
      avatar: petOwner.avatar,
      phone: petOwner.phone,
      roles: petOwner.roles,
      isActive: petOwner.isActive,
      // token and message for testing, can remove when merge with dev
      token,
      message: `A verification email has been sent to ${email}.`,
    });
  } else {
    res.status(400).json({ message: "Failing to create the petOwner" });
  }
};

// @desc Verify email
// @route GET /auth/verify/:userId/:token/
// @access Public
export const verifyEmail: RequestHandler = async (req, res, next) => {
  const { userId, token } = req.params;

  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid pet owner id." });
    }

    const foundPetOwner = await PetOwner.findById(userId);
    if (!foundPetOwner) {
      return res.status(401).json({ message: "Account not found" });
    }

    jwt.verify(token, env.JWT_KEY, async function (err) {
      if (err) {
        return res.status(404).json({ error: "please verify your email" });
      }
      if (foundPetOwner.isActive) {
        return res.status(409).json({ message: "Email already verified" });
      }
      const updatedPetOwner = await PetOwner.findByIdAndUpdate(
        userId,
        { $set: { isActive: true } },
        { new: true }
      );
      if (updatedPetOwner) {
        res.status(201).json({
          _id: updatedPetOwner._id,
          firstName: updatedPetOwner.firstName,
          lastName: updatedPetOwner.lastName,
          userName: updatedPetOwner.userName,
          email: updatedPetOwner.email,
          avatar: updatedPetOwner.avatar,
          phone: updatedPetOwner.phone,
          roles: updatedPetOwner.roles,
          isActive: updatedPetOwner.isActive,
        });
      } else {
        res.status(400).json({ message: "Failing to active the petOwner" });
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login
// @route POST /auth/login
// @access Public
export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  //check all required data
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check email is valid
  const foundPetOwner = await PetOwner.findOne({ email });

  if (!foundPetOwner) {
    return res.status(401).json({ message: "Account not found" });
  }

  if (!foundPetOwner.isActive) {
    return res.status(401).json({ message: "Please verify your email" });
  }

  const match = await bcrypt.compare(password, foundPetOwner.password);

  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = jwt.sign(
    {
      PetOwnerInfo: {
        id: foundPetOwner._id,
        email: foundPetOwner.email,
        roles: foundPetOwner.roles,
      },
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "45d" }
  );

  const refreshToken = jwt.sign(
    {
      PetOwnerInfo: {
        email: foundPetOwner.email,
      },
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const currentPetOwner = _.omit(foundPetOwner.toObject(), ["_password", "__v"]);

  //create cookie with refresh token
  res.cookie("jsonWebToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //  7d
  });

  res.status(200).json({ accessToken, currentPetOwner });
};

// @desc refresh
// @route GET /auth/refresh
// @access Public
export const refreshToken: RequestHandler = (req, res) => {
  const cookies = req.cookies;
  console.log("cookies", cookies);
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    console.log("decoded", decoded);

    const foundPetOwner = await PetOwner.findOne({ email: decoded.PetOwnerInfo.email });
    console.log("foundPetOwner", foundPetOwner);
    if (!foundPetOwner) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = jwt.sign(
      {
        PetOwnerInfo: {
          id: foundPetOwner._id,
          email: foundPetOwner.email,
          roles: foundPetOwner.roles,
        },
      },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.status(200).json({ accessToken });
  });
};

// @desc Google Login
// @route POST /auth/google
// @access Public
export const googleLogin: RequestHandler = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: "Authorization token not provided." });
  }
  const client = new OAuth2Client(env.GOOGLE_OAUTH_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const payload = ticket.getPayload() as TokenPayload;
  const { name, email, sub } = payload;

  const foundPetOwner = await PetOwner.findOne({ email });

  if (!foundPetOwner) {
    const petOwner = await PetOwner.create({
      email,
      userName: name,
      googleSubId: sub,
      firstName: name,
      lastName: name,
    });

    const accessToken = jwt.sign(
      {
        PetOwnerInfo: {
          id: petOwner._id,
          email: petOwner.email,
          roles: petOwner.roles,
        },
      },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: "45d" }
    );

    const refreshToken = jwt.sign(
      {
        PetOwnerInfo: {
          email: petOwner.email,
        },
      },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    const currentPetOwner = _.omit(petOwner.toObject(), ["_password", "__v"]);

    //create cookie with refresh token
    res.cookie("jsonWebToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, //  7d
    });

    return res.status(200).json({ accessToken, currentPetOwner });
  }

  const accessToken = jwt.sign(
    {
      PetOwnerInfo: {
        id: foundPetOwner._id,
        email: foundPetOwner.email,
        roles: foundPetOwner.roles,
      },
    },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: "45d" }
  );

  const refreshToken = jwt.sign(
    {
      PetOwnerInfo: {
        email: foundPetOwner.email,
      },
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  const currentPetOwner = _.omit(foundPetOwner.toObject(), ["_password", "__v"]);

  //create cookie with refresh token
  res.cookie("jsonWebToken", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //  7d
  });

  return res.status(200).json({ accessToken, currentPetOwner });
};
