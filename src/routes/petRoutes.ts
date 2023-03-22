import express from "express";
import * as petController from "../controllers/pet";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Add a pet
router.post("/add/:id", upload.single("file"), petController.addPet);

// Update a pet
router.put("/update/:id", upload.single("file"), petController.updatePet);

// Delete a pet
router.delete("/delete/:id", petController.deletePet);

export default router;
