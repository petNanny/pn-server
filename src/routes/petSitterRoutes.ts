import express from "express";
import * as petSitterController from "../controllers/petSitter";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

//Get all
router.get("/", petSitterController.getPetSitters);
//Get one
router.get("/:id", petSitterController.getPetSitter);

//Update
router.post("/updatePetSitter/:id", petSitterController.updatePetSitter);

//Create
router.post("/createPetSitter/:id", petSitterController.createPetSitter);

// filter pet sitter
router.post("/filter", petSitterController.filterPetSitter);

export default router;
