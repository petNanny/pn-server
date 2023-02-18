import { RequestHandler } from "express";
// @desc Get all pet sitters
// @route GET /petSitter
// @access Public
export const getPetSitters: RequestHandler = async (req, res) => {
  res.json({ message: "getPetSitters" });
};
// @desc Get one pet sitters
// @route GET /petSitter/:id
// @access Private
export const getPetSitter: RequestHandler = async (req, res) => {
  res.json({ message: "getPetSitter" });
};
// @desc Update one pet sitters
// @route POST /petSitter
// @access Private
export const updatePetSitter: RequestHandler = async (req, res) => {
  res.json({ message: "updatePetSitter" });
};
