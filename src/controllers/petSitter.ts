import createHttpError from "http-errors";
import { RequestHandler } from "express";
import PetSitter from "../models/PetSitterModel";
import PetOwner from "../models/PetOwnerModel";
import mongoose from "mongoose";

// @desc Get all pet sitters
// @route GET /petSitter
// @access Public
export const getPetSitters: RequestHandler = async (req, res, next) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT;
    const total = await PetSitter.countDocuments({});
    //TODO:
    //sort will be changed later, so far use create_time desc
    //will add this filter { isActivePetSitter: true }
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

    const petSitter = await PetSitter.findById(petSitterId).populate({
      path: "petOwner",
      select: "-password",
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
