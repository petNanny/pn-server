import createHttpError from "http-errors";
import { RequestHandler } from "express";
import PetSitter from "../models/PetSitterModel";
import PetOwner from "../models/PetOwnerModel";
import mongoose from "mongoose";
import { getDistance } from "geolib";

interface filterValues {
  "service.service"?: {
    $eq: "Dog boarding" | "Doggy day care" | "Dog walking" | "Home visits" | "House sitting";
  };
  notAvailableDates?: { $nin: Date[] };
  geoCode?: {
    $near: {
      $geometry: {
        type: "Point";
        coordinates: number[];
      };
      $maxDistance: number;
    };
  };
  "preference.size"?: {
    $all: string[];
  };
  "preference.petTypes"?: {
    $all: string[];
  };
  "home.fenced"?: boolean;
  "home.kids"?: string;
}

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

    let foundPetOwner = await PetOwner.findOne({ _id: petOwnerId });

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

    foundPetOwner = await PetOwner.findByIdAndUpdate(
      foundPetOwner._id,
      { $push: { roles: "PetSitter" }, $set: { petSitter: petSitterInfo._id } },
      { new: true }
    );

    const petSitterFullInfo = await PetSitter.findOne({ _id: petSitterInfo._id }).populate({
      path: "petOwner",
      select: "-password",
      strictPopulate: false,
    });

    if (!petSitterInfo) {
      throw createHttpError(400, "Failing to create the petSitter");
    }

    res.status(201).json({ petSitterFullInfo });
  } catch (error) {
    next(error);
  }
};

// @filter pet sitter
// @route POST /filter
export const filterPetSitter: RequestHandler = async (req, res, next) => {
  const {
    selectedDates,
    petService,
    latitude,
    longitude,
    smallDog,
    mediumDog,
    largeDog,
    giantDog,
    cat,
    smallAnimal,
    noChildren,
    fencedBackyard,
  } = req.body;

  const petSize: string[] = [];
  if (smallDog && smallDog > 0) {
    petSize.push("Small");
  }
  if (mediumDog && mediumDog > 0) {
    petSize.push("Medium");
  }
  if (largeDog && largeDog > 0) {
    petSize.push("Large");
  }
  if (giantDog && giantDog > 0) {
    petSize.push("Giant");
  }

  const petType: string[] = [];
  if (cat && cat > 0) {
    petType.push("Cats");
  }
  if (smallAnimal && smallAnimal > 0) {
    petType.push("Small animals");
  }

  const filter: filterValues = {};
  if (petService) {
    filter["service.service"] = { $eq: petService };
  }
  if (selectedDates) {
    filter.notAvailableDates = { $nin: selectedDates };
  }
  if (latitude && longitude) {
    filter.geoCode = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: 50000,
      },
    };
  }
  if (petSize && petSize.length > 0) {
    filter["preference.size"] = { $all: petSize };
  }
  if (petType && petType.length > 0) {
    filter["preference.petTypes"] = { $all: petType };
  }
  if (typeof fencedBackyard === "boolean" && fencedBackyard === true) {
    filter["home.fenced"] = fencedBackyard;
  }
  if (noChildren === true) {
    filter["home.kids"] = "None";
  }

  try {
    const results = await PetSitter.find(filter)
      .populate({
        path: "petOwner",
        select: "-password",
      })
      .exec();

    const distances = results.map((result: any) => {
      return getDistance(
        { latitude: latitude, longitude: longitude },
        { latitude: result.geoCode.coordinates[1], longitude: result.geoCode.coordinates[0] }
      );
    });

    const distanceStrings = distances.map((distance: number) => {
      if (distance <= 1000) {
        return "< 1 km";
      } else if (distance <= 5000) {
        return "< 5 km";
      } else if (distance <= 10000) {
        return "< 10 km";
      } else if (distance <= 20000) {
        return "< 20 km";
      } else if (distance <= 50000) {
        return "< 50 km";
      } else {
        return "> 50 km";
      }
    });

    const updatedResults = results.map((result: any, index: number) => {
      return {
        ...result._doc,
        distance: distanceStrings[index],
      };
    });

    res.status(200).json(updatedResults);
  } catch (error) {
    next(error);
  }
};
