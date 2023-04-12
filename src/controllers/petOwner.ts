import createHttpError from "http-errors";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import PetOwner from "../models/PetOwnerModel";

// @desc get one petOwner
// @route GET /petOwners
// @access Private
export const getPetOwner: RequestHandler = async (req, res, next) => {
  const petOwnerId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet owner id.");
    }
    if (!petOwnerId) {
      throw createHttpError(400, "Pet owner ID Required");
    }
    const petOwner = await PetOwner.findById(petOwnerId)
      .populate({
        path: "petSitter",
        strictPopulate: false,
      })
      .populate({
        path: "pets",
        strictPopulate: false,
      });
    if (!petOwner || !petOwner.isActive) {
      throw createHttpError(400, "Pet owner not found");
    }

    res.status(200).json(petOwner);
  } catch (error) {
    next(error);
  }
};

// @desc Get all petOwners
// @route GET /petOwners
// @access Public
export const getPetOwners: RequestHandler = async (req, res, next) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await PetOwner.countDocuments({});

    const PetOwners = await PetOwner.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

    res.status(200).json({
      data: PetOwners,
      currentPage: Number(page),
      numberOfPage: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    next(error);
  }
};

// @desc petOwner update
// @route Patch /petOwners
// @access Private
export const updatePetOwner: RequestHandler = async (req, res, next) => {
  const petOwnerId = req.params.id;
  const { firstName, lastName, userName, avatar, phone } = req.body;

  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet owner id.");
    }

    if (!petOwnerId) {
      throw createHttpError(400, "Pet owner ID Required");
    }

    const petOwner = await PetOwner.findByIdAndUpdate(
      petOwnerId,
      { firstName, lastName, userName, avatar, phone },
      { new: true }
    ).exec();

    if (!petOwner) {
      throw createHttpError(400, "Pet owner not found");
    }

    res.status(200).json(petOwner);
  } catch (error) {
    next(error);
  }
};

// @desc petOwner delete
// @route Patch /petOwners/deletePetOwner
// @access Private
export const deletePetOwner: RequestHandler = async (req, res, next) => {
  const petOwnerId = req.params.id;
  try {
    if (!petOwnerId) {
      throw createHttpError(400, "Pet owner ID Required");
    }

    const petOwner = await PetOwner.findByIdAndUpdate(
      petOwnerId,
      { isActive: false },
      { new: true }
    ).exec();

    if (!petOwner) {
      throw createHttpError(400, "Pet owner not found");
    }

    res.status(200).json({ message: "Pet owner delete successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc Logout
// @route POST /petOwners/logout
// @access Public
export const logout: RequestHandler = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jsonWebToken) return res.sendStatus(204);
  res.clearCookie("jsonWebToken", {
    httpOnly: true,
    sameSite: "none",
  });
  res.json({ message: "Cookie cleared" });
};
