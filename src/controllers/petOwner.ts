import createHttpError from "http-errors";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import PetOwner from "../models/PetOwnerModel";
import AWS from "aws-sdk";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import env from "../util/validateEnv";
import url from "url";

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

// pet owner upload/update avatar
// @route POST /uploadAvatar/:id
export const uploadAvatar: RequestHandler = async (req, res, next) => {
  try {
    const petOwnerId = req.params.id;
    const fileContent = req.file;

    if (!fileContent) {
      return res.status(404).json({ error: "Image not found." });
    }

    const uniqueId = uuid().slice(0, 16);
    const newFileName = `${petOwnerId}-${uniqueId}-resized.jpeg`;
    const resizedImage = await sharp(fileContent.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 30 })
      .toBuffer();

    if (!mongoose.isValidObjectId(petOwnerId)) {
      return res.status(400).json({ error: "Invalid pet sitter id." });
    }
    const foundPetOwner = await PetOwner.findById(petOwnerId);
    if (!foundPetOwner) {
      return res.status(404).json({ error: "Pet owner not found." });
    }

    const s3 = new AWS.S3({
      region: env.AWS_BUCKET_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    });

    // delete old avatar
    const foundOldAvatar = foundPetOwner.avatar;
    if (foundOldAvatar) {
      const oldAvatarFileName = url.parse(foundOldAvatar).pathname?.substring(1);
      const oldAvatarParams = {
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${oldAvatarFileName}`,
      };
      await s3.deleteObject(oldAvatarParams).promise();
    }

    // upload new avatar
    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: `${petOwnerId}/${newFileName}`,
      Body: resizedImage,
    };
    const result = await s3.upload(params).promise();
    const uploadAvatar = await PetOwner.findByIdAndUpdate(
      petOwnerId,
      { $set: { avatar: result.Location } },
      { new: true }
    );
    if (!uploadAvatar) {
      return res.status(400).json({ error: "Failing to upload attachment" });
    }

    return res.status(201).json({
      message: `File uploaded to ${result.Location} successfully`,
      uploadAvatar,
    });
  } catch (err) {
    next(err);
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
