import createHttpError from "http-errors";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import PetOwner from "../models/PetOwnerModel";
import PetSitter from "../models/PetSitterModel";

interface filterValues {
  filter: {
    selectedDates: string[] | undefined;
    petServices: [
      service: "Dog boarding" | "Doggy day care" | "Dog walking" | "Home visits" | "House sitting",
      serviceDesc: string,
      Rate: number,
      isActive: boolean,
    ]
  }
}

export const filterPetSitter: RequestHandler = async (req, res, next) => {
  const { selectedDates, petService, latitude, longitude } = req.body;

  // let filter: any = {};
  // if (petServices) {
  //   filter.petService = {}
  // }

  try {
    const results = await PetSitter.find({
      "service.service": { $eq: petService }
    }).exec();
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};