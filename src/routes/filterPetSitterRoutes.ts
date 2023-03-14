import express from "express";
import * as searchController from "../controllers/filterPetSitter";

const router = express.Router();

// filter pet sitter
router.post("/", searchController.filterPetSitter);

export default router;
