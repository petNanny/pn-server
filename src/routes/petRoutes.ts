import express from "express";
import * as petController from "../controllers/pet";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all pets
router.get("/allPets/:id", petController.getAllPets);

// Get one pet
router.get("/onePet/:id", petController.getOnePet);

//Add a pet
router.post("/add/:id", upload.single("avatar"), petController.addPet);

// Update a pet
router.put("/update/:id", upload.single("avatar"), petController.updatePet);

// Delete a pet
router.delete("/delete/:id", petController.deletePet);

export default router;
