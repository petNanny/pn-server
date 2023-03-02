import createHttpError from "http-errors";
import { RequestHandler } from "express";
import PetSitter from "../models/PetSitterModel";
import PetOwner from "../models/PetOwnerModel";
import mongoose from "mongoose";
import AWS from "aws-sdk";
import env from "../util/validateEnv";
import sharp from "sharp";
import Attachment from "../models/AttachmentModel";

// @desc Get all pet sitters
// @route GET /petSitter
// @access Public
export const getPetSitters: RequestHandler = async (req, res, next) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await PetSitter.countDocuments({});

    //sort will be changed later, so far use create_time desc
    const petSitters = await PetSitter.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex)
      .populate({ path: "petOwner", select: "-password" });

    res.status(200).json({
      data: petSitters,
      currentPage: Number(page),
      numberOfPage: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get one pet sitters
// @route GET /petSitter/:id
// @access Public
export const getPetSitter: RequestHandler = async (req, res, next) => {
  const petSitterId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petSitterId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const petSitter = await PetSitter.findById(petSitterId)
      .populate({
        path: "petOwner",
        select: "-password",
      })
      .populate({
        path: "images",
      });

    if (!petSitter) {
      throw createHttpError(404, "Pet sitter not found.");
    }
    res.status(200).json(petSitter);
  } catch (error) {
    next(error);
  }
};

// @desc Update one pet sitters
// @route POST /updateInfo/:id
// @access Private
export const updatePetSitter: RequestHandler = async (req, res, next) => {
  const petSitterInfo = req.body;
  const petSitterId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(petSitterId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const updatePetSitter = await PetSitter.findByIdAndUpdate(
      petSitterId,
      { ...petSitterInfo },
      { new: true }
    ).populate({ path: "petOwner", select: "-password" });

    if (!updatePetSitter) {
      throw createHttpError(404, "Pet sitter not found.");
    }

    res.status(200).json({ updatePetSitter });
  } catch (error) {
    next(error);
  }
};

// @desc create one pet sitter
// @route POST /petSitterInfo/:id
// @access Private
export const createPetSitter: RequestHandler = async (req, res, next) => {
  const {
    address,
    images,
    languages,
    introduction,
    description,
    service,
    additionalService,
    policy,
    preference,
    home,
    walkingAreas,
    experiences,
    experienceDesc,
    completedCheck,
    bankAccount,
    abn,
    isActivePetSitter,
  } = req.body;

  const petOwnerId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet owner id.");
    }

    const foundPetOwner = await PetOwner.findOne({ _id: petOwnerId });

    if (!foundPetOwner) {
      throw createHttpError(404, "Pet owner not found.");
    }

    const duplicate = await PetSitter.findOne({ petOwner: foundPetOwner._id });

    if (duplicate) {
      throw createHttpError(409, "User has been created ");
    }

    const petSitterInfo = await PetSitter.create({
      petOwner: foundPetOwner._id,
      address,
      images,
      languages,
      introduction,
      description,
      service,
      additionalService,
      policy,
      preference,
      home,
      walkingAreas,
      experiences,
      experienceDesc,
      completedCheck,
      bankAccount,
      abn,
      isActivePetSitter,
    });

    const petSitterFullInfo = await PetSitter.findOne({ _id: petSitterInfo._id }).populate({
      path: "petOwner",
      select: "-password",
      strictPopulate: false,
    });

    if (!petSitterInfo) {
      throw createHttpError("400", "Failing to create the petSitter");
    }

    res.status(201).json({ petSitterFullInfo });
  } catch (error) {
    next(error);
  }
};

// pet sitter upload attachments
// @route POST /upload/:id
export const uploadAttachments: RequestHandler = async (req, res, next) => {
  const petSitterId = req.params.id;
  const fileName = req.file?.originalname;
  const fileContent = req.file?.buffer;
  const newFileName = `${fileName?.split(".")[0]}-resized.jpeg`;
  const resizedImage = await sharp(fileContent).toFormat("jpeg").jpeg({ quality: 80 }).toBuffer();

  try {
    if (!mongoose.isValidObjectId(petSitterId)) {
      return res.status(400).json({ error: "Invalid pet sitter id." });
    }

    const duplicate = await Attachment.findOne({
      $and: [{ fileName: newFileName }, { petSitterId: petSitterId }],
    });
    if (duplicate) {
      return res
        .status(409)
        .json({ error: "Image has been uploaded, please rename file or upload another one" });
    }

    const s3 = new AWS.S3({
      region: env.AWS_BUCKET_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    });
    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: `${petSitterId}/${newFileName}`,
      Body: resizedImage,
    };
    const result = await s3.upload(params).promise();

    const uploadAttachment = await Attachment.create({
      url: result.Location,
      fileName: newFileName,
      petSitterId: petSitterId,
    });
    if (!uploadAttachment) {
      return res.status(400).json({ error: "Failing to upload attachment" });
    }

    const updatePetSitterImage = await PetSitter.findByIdAndUpdate(
      petSitterId,
      { $push: { images: uploadAttachment._id } },
      { new: true }
    ).populate({ path: "images" });
    res.status(201).json({
      message: `File uploaded to ${result.Location} successfully`,
      updatePetSitterImage,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
    next(err);
  }
};

// pet sitter delete attachments
// @route DELETE /delete/:id
export const deleteAttachments: RequestHandler = async (req, res, next) => {
  const { fileName } = req.body;
  try {
    const s3 = new AWS.S3({
      region: env.AWS_BUCKET_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    });
    const petSitterId = req.params.id;

    if (!mongoose.isValidObjectId(petSitterId)) {
      return res.status(400).json({ error: "Invalid pet sitter id." });
    }
    const petSitter = await PetSitter.findById(petSitterId).populate({ path: "images" });
    if (!petSitter) {
      return res.status(404).json({ error: "Pet sitter not found." });
    }

    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: `${petSitterId}/${fileName}`,
    };
    const deleteImageOnS3 = await s3.deleteObject(params).promise();

    const foundImage = await Attachment.findOne({
      $and: [{ fileName: fileName }, { petSitterId: petSitterId }],
    });
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." });
    }
    const deleteImage = await PetSitter.updateOne(
      { _id: petSitterId },
      { $pull: { images: foundImage._id } }
    );
    if (deleteImage.modifiedCount === 0) {
      return res.status(400).json({ error: "failed to delete image from petSitter" });
    }
    const deleteImageOnAttachment = await Attachment.findOneAndDelete({ _id: foundImage._id });
    if (deleteImageOnAttachment) {
      return res.status(400).json({ error: "failed to delete image from petSitter" });
    }

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
    next(err);
  }
};
