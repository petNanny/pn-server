import createHttpError from "http-errors";
import { RequestHandler } from "express";
import PetOwner from "../models/PetOwnerModel";
import mongoose from "mongoose";
import Pet from "../models/PetModel";
import AWS from "aws-sdk";
import env from "../util/validateEnv";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import url from "url";

// @desc Get one pet owner's all pets
// @route GET /allPets/:id
// @access Public
export const getAllPets: RequestHandler = async (req, res, next) => {
  const petOwnerId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const pet = await Pet.find({ petOwner: petOwnerId }).populate({
      path: "petOwner",
      select: "-password",
    });

    if (!pet) {
      throw createHttpError(404, "Pet not found.");
    }
    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};

// @desc Get one pet
// @route GET /onePet/:id
// @access Public
export const getOnePet: RequestHandler = async (req, res, next) => {
  const petId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const pet = await Pet.findById(petId).populate({
      path: "petOwner",
      select: "-password",
    });

    if (!pet) {
      throw createHttpError(404, "Pet not found.");
    }
    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};

// @desc add one pet
// @route POST /add/:id
export const addPet: RequestHandler = async (req, res, next) => {
  const {
    petName,
    species,
    breed,
    size,
    gender,
    yearOfBirth,
    neutered,
    vaccinated,
    chipped,
    houseTrained,
    friendlyWithDogs,
    friendlyWithCats,
    friendlyWithKids,
    friendlyWithAdults,
    description,
  } = req.body;
  const fileContent = req.file;
  const petOwnerId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet owner id.");
    }

    let foundPetOwner = await PetOwner.findById(petOwnerId);
    if (!foundPetOwner) {
      throw createHttpError(404, "Pet owner not found.");
    }

    let result;
    if (fileContent) {
      const uniqueId = uuid().slice(0, 16);
      const fileName = `${petOwnerId}-${uniqueId}-resized.jpeg`;
      const resizedImage = await sharp(fileContent?.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 30 })
        .toBuffer();

      const s3 = new AWS.S3({
        region: env.AWS_BUCKET_REGION,
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      });
      const params = {
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${petOwnerId}/${fileName}`,
        Body: resizedImage,
      };
      result = await s3.upload(params).promise();
    }

    const defaultAvatar = "https://icon-library.com/images/icon-dogs/icon-dogs-7.jpg";

    const petInfo = await Pet.create({
      petOwner: foundPetOwner._id,
      avatar: result?.Location || defaultAvatar,
      petName,
      species,
      breed,
      size,
      gender,
      yearOfBirth: parseInt(yearOfBirth, 10),
      neutered: neutered === "true" ? true : false,
      vaccinated: vaccinated === "true" ? true : false,
      chipped: chipped === "true" ? true : false,
      houseTrained: houseTrained === "true" ? true : false,
      friendlyWithDogs: friendlyWithDogs === "true" ? true : false,
      friendlyWithCats: friendlyWithCats === "true" ? true : false,
      friendlyWithKids: friendlyWithKids === "true" ? true : false,
      friendlyWithAdults: friendlyWithAdults === "true" ? true : false,
      description,
    });

    foundPetOwner = await PetOwner.findByIdAndUpdate(
      foundPetOwner._id,
      { $push: { pets: petInfo._id } },
      { new: true }
    );

    const petFullInfo = await Pet.findOne({ _id: petInfo._id }).populate({
      path: "petOwner",
      select: "-password",
      strictPopulate: false,
    });

    if (!petFullInfo) {
      throw createHttpError(400, "Failing to add a pet");
    }

    res.status(201).json(petFullInfo);
  } catch (error) {
    next(error);
  }
};

// @desc update one pet
// @route PUT /update/:id
export const updatePet: RequestHandler = async (req, res, next) => {
  const petInfo = { ...req.body };
  const petId = req.params.id;
  const fileContent = req.file;

  try {
    if (!mongoose.isValidObjectId(petId)) {
      throw createHttpError(400, "Invalid pet id.");
    }

    const foundPet = await Pet.findById(petId).populate({ path: "petOwner" });
    if (!foundPet) {
      return res.status(404).json({ error: "Pet not found." });
    }

    const s3 = new AWS.S3({
      region: env.AWS_BUCKET_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    });

    if (fileContent) {
      // delete old avatar
      const foundOldAvatar = foundPet.avatar;
      if (foundOldAvatar) {
        const oldAvatarFileName = url.parse(foundOldAvatar).pathname?.substring(1);
        const oldAvatarParams = {
          Bucket: env.AWS_BUCKET_NAME,
          Key: `${oldAvatarFileName}`,
        };
        await s3.deleteObject(oldAvatarParams).promise();
      }

      // upload new avatar
      const uniqueId = uuid().slice(0, 16);
      const newFileName = `${foundPet.petOwner?._id}-${uniqueId}-resized.jpeg`;
      const resizedImage = await sharp(fileContent?.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 30 })
        .toBuffer();
      const params = {
        Bucket: env.AWS_BUCKET_NAME,
        Key: `${foundPet.petOwner?._id}/${newFileName}`,
        Body: resizedImage,
      };
      const result = await s3.upload(params).promise();
      petInfo.avatar = result.Location;
    }

    const updatedPetInfo = {
      ...petInfo,
      yearOfBirth: parseInt(petInfo.yearOfBirth, 10),
      neutered: petInfo.neutered === "true" ? true : false,
      vaccinated: petInfo.vaccinated === "true" ? true : false,
      chipped: petInfo.chipped === "true" ? true : false,
      houseTrained: petInfo.houseTrained === "true" ? true : false,
      friendlyWithDogs: petInfo.friendlyWithDogs === "true" ? true : false,
      friendlyWithCats: petInfo.friendlyWithCats === "true" ? true : false,
      friendlyWithKids: petInfo.friendlyWithKids === "true" ? true : false,
      friendlyWithAdults: petInfo.friendlyWithAdults === "true" ? true : false,
    };

    const updatePet = await Pet.findByIdAndUpdate(petId, updatedPetInfo, { new: true }).populate({
      path: "petOwner",
      select: "-password",
    });

    if (!updatePet) {
      throw createHttpError(404, "Pet not found.");
    }

    res.status(200).json(updatePet);
  } catch (error) {
    next(error);
  }
};

// delete one pet
// @route DELETE /delete/:id
export const deletePet: RequestHandler = async (req, res, next) => {
  const petId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petId)) {
      return res.status(400).json({ error: "Invalid pet id." });
    }
    const foundPet = await Pet.findById(petId);

    if (!foundPet) {
      return res.status(404).json({ error: "Pet not found." });
    }

    const deletePetFromPetOwner = await PetOwner.updateOne(
      { _id: foundPet.petOwner?._id },
      { $pull: { pets: foundPet._id } }
    );
    if (deletePetFromPetOwner.modifiedCount === 0) {
      return res.status(400).json({ error: "failed to delete pet from PetOwner" });
    }
    const deleteImageOnPet = await Pet.deleteOne({ _id: foundPet._id });
    if (deleteImageOnPet.deletedCount === 0) {
      return res.status(400).json({ error: "failed to delete pet from Pet" });
    }

    return res.status(200).json({ message: "Pet deleted successfully" });
  } catch (err) {
    next(err);
  }
};
