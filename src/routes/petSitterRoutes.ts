import express from "express";
import * as petSitterController from "../controllers/petSitter";
import { verifyJWT } from "../middleware/verifyJWT";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Get all
router.get("/", petSitterController.getPetSitters);
//Get one
router.get("/:id", petSitterController.getPetSitter);

//Update
router.post("/updatePetSitter/:id", petSitterController.updatePetSitter);

//Create
router.post("/createPetSitter/:id", petSitterController.createPetSitter);

//Upload attachments
router.post("/upload/:id", upload.single("file"), petSitterController.uploadAttachments);

// Delete attachments
router.delete("/delete/:id", petSitterController.deleteAttachments);

export default router;
