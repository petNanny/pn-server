import express from "express";
import * as petOwnerController from "../controllers/petOwner";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

//Get all petOwners
router.get("/", petOwnerController.getPetOwners);
router.get("/:id", verifyJWT, petOwnerController.getPetOwner);
router.patch("/:id", petOwnerController.updatePetOwner);
router.patch("/deletePetOwner/:id", petOwnerController.deletePetOwner);

router.post("/logout", petOwnerController.logout);
export default router;
