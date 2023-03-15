import createHttpError from "http-errors";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import PetSitter from "../models/PetSitterModel";

interface filterValues {
  filter: {
    selectedDates: string[] | undefined;
    petServices: [
      service: "Dog boarding" | "Doggy day care" | "Dog walking" | "Home visits" | "House sitting",
      serviceDesc: string,
      Rate: number,
      isActive: boolean
    ];
  };
}

export const filterPetSitter: RequestHandler = async (req, res, next) => {
  const { selectedDates, petService, latitude, longitude } = req.body;

  const filter: any = {};
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

  try {
    const results = await PetSitter.find(filter).exec();
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
