import createHttpError from "http-errors";
import { RequestHandler } from "express";
import PetSitter from "../models/PetSitterModel";
import PetOwner from "../models/PetOwnerModel";
import mongoose from "mongoose";
import AWS from "aws-sdk";
import env from "../util/validateEnv";
import sharp from "sharp";
import Image from "../models/ImagesModel";
import { getDistance } from "geolib";

interface filterValues {
  "service.service"?: {
    $eq: "Dog boarding" | "Doggy day care" | "Dog walking" | "Home visits" | "House sitting";
  };
  notAvailableDates?: { $nin: string[] };
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

    const petSitter = await PetSitter.findById(petSitterId)
      .populate({
        path: "petOwner",
        select: "-password",
      })
      .populate("images");

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
    geoCode,
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
      geoCode,
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

// @asc by order number, user get own images using login user id
// @route GET /images/:id
export const userGetOwnImages: RequestHandler = async (req, res, next) => {
  const petOwnerId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const petSitter = await PetSitter.findOne({ petOwner: petOwnerId })
      .populate({ path: "images" })
      .populate({ path: "petOwner" });
    if (!petSitter) {
      return res.status(404).json({ error: "Pet sitter not found." });
    }

    const petSitterImages = await Image.find({ petOwner: petOwnerId }).sort({ orderNumber: 1 });

    res.status(200).json(petSitterImages);
  } catch (error) {
    next(error);
  }
};

// @asc by order number user get pet sitter images using url pet sitter id
// @route GET /petSitter-images/:id
export const userGetPetSitterImages: RequestHandler = async (req, res, next) => {
  const petSitterId = req.params.id;
  try {
    if (!mongoose.isValidObjectId(petSitterId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const petSitter = await PetSitter.findById(petSitterId)
      .populate({ path: "images" })
      .populate({ path: "petOwner" });
    if (!petSitter) {
      return res.status(404).json({ error: "Pet sitter not found." });
    }

    const petSitterImages = await Image.find({ petOwner: petSitter.petOwner?._id }).sort({
      orderNumber: 1,
    });

    res.status(200).json(petSitterImages);
  } catch (error) {
    next(error);
  }
};

// pet sitter upload attachments
// @route POST /upload/:id
export const uploadAttachments: RequestHandler = async (req, res, next) => {
  try {
    const petOwnerId = req.params.id;

    const fileContent = req.file;
    if (!fileContent) {
      return res.status(404).json({ error: "Image not found." });
    }
    const fileName = req.file?.originalname;
    const newFileName = `${fileName?.split(".")[0]}-${petOwnerId}-resized.jpeg`;
    const resizedImage = await sharp(fileContent.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 30 })
      .toBuffer();

    if (!mongoose.isValidObjectId(petOwnerId)) {
      return res.status(400).json({ error: "Invalid pet sitter id." });
    }
    const petSitter = await PetSitter.findOne({ petOwner: petOwnerId })
      .populate({ path: "images" })
      .populate({ path: "petOwner" });
    if (!petSitter) {
      return res.status(404).json({ error: "Pet sitter not found." });
    }

    const duplicate = await Image.findOne({ fileName: newFileName });
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
      Key: `${petOwnerId}/${newFileName}`,
      Body: resizedImage,
    };
    const result = await s3.upload(params).promise();

    const highestOrderImage = await Image.findOne({ petOwner: petOwnerId }).sort("-orderNumber");
    let orderNumber;
    if (highestOrderImage && highestOrderImage.orderNumber) {
      orderNumber = highestOrderImage.orderNumber + 1;
    } else {
      orderNumber = 1;
    }

    const uploadAttachment = await Image.create({
      url: result.Location,
      fileName: newFileName,
      petOwner: petOwnerId,
      orderNumber: orderNumber,
    });
    if (!uploadAttachment) {
      return res.status(400).json({ error: "Failing to upload attachment" });
    }

    const updatePetSitterImage = await PetSitter.findOneAndUpdate(
      { petOwner: petOwnerId },
      { $push: { images: uploadAttachment._id } },
      { new: true }
    )
      .populate({ path: "images" })
      .populate({ path: "petOwner" });
    return res.status(201).json({
      message: `File uploaded to ${result.Location} successfully`,
      updatePetSitterImage,
    });
  } catch (err) {
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
    const petOwnerId = req.params.id;

    if (!mongoose.isValidObjectId(petOwnerId)) {
      return res.status(400).json({ error: "Invalid pet sitter id." });
    }
    const petSitter = await PetSitter.findOne({ petOwner: petOwnerId })
      .populate({ path: "images" })
      .populate({ path: "petOwner" });
    if (!petSitter) {
      return res.status(404).json({ error: "Pet sitter not found." });
    }

    const params = {
      Bucket: env.AWS_BUCKET_NAME,
      Key: `${petOwnerId}/${fileName}`,
    };
    const deleteImageOnS3 = await s3.deleteObject(params).promise();

    const foundImage = await Image.findOne({ fileName: fileName });
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." });
    }
    const deleteImage = await PetSitter.updateOne(
      { _id: petSitter._id },
      { $pull: { images: foundImage._id } }
    );
    if (deleteImage.modifiedCount === 0) {
      return res.status(400).json({ error: "failed to delete image from PetSitter" });
    }
    const deleteImageOnAttachment = await Image.deleteOne({ _id: foundImage._id });
    if (deleteImageOnAttachment.deletedCount === 0) {
      return res.status(400).json({ error: "failed to delete image from Attachment" });
    }

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// @update pet sitter images order
// @route GET /images/:id
export const updateImagesOrder: RequestHandler = async (req, res, next) => {
  const petOwnerId = req.params.id;
  const petSitterImages = req.body;

  try {
    if (!mongoose.isValidObjectId(petOwnerId)) {
      throw createHttpError(400, "Invalid pet sitter id.");
    }

    const petSitter = await PetSitter.findOne({ petOwner: petOwnerId }).populate({
      path: "petOwner",
    });
    if (!petSitter) {
      return res.status(404).json({ error: "Pet sitter not found." });
    }

    petSitterImages.forEach(async (petSitterImage: any, index: number) => {
      try {
        await Image.findByIdAndUpdate(petSitterImage._id, { orderNumber: index }, { new: true });
      } catch (err) {
        console.log(err);
        throw createHttpError(200, "failed to update images order.");
      }
    });

    res.status(200).json(petSitterImages);
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
    page,
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

  const LIMIT = 1;
  const startIndex = (Number(page) - 1) * LIMIT;

  try {
    const results = await PetSitter.find(filter)
      .limit(LIMIT)
      .skip(startIndex)
      .populate({
        path: "petOwner",
        select: "-password",
      })
      .exec();

    const newResults = await PetSitter.find(filter)
      .populate({
        path: "petOwner",
        select: "-password",
      })
      .exec();

    const totalNumber = newResults.length;
    console.log(totalNumber);

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

    res.status(200).json({
      updatedResults: updatedResults,
      currentPage: Number(page),
      totalPages: Math.ceil(totalNumber / LIMIT),
    });
  } catch (error) {
    next(error);
  }
};
