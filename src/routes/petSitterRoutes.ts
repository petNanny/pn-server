import express from "express";
import * as petSitterController from "../controllers/petSitter";
import { verifyJWT } from "../middleware/verifyJWT";
import multer from 'multer';

const router = express.Router();

//Get all
router.get("/", petSitterController.getPetSitters);
//Get one
router.get("/:id", petSitterController.getPetSitter);

//Update
router.post("/updatePetSitter/:id", petSitterController.updatePetSitter);

//Create
router.post("/createPetSitter/:id", petSitterController.createPetSitter);

//Upload attachments
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/upload/:id", upload.single("file"), petSitterController.uploadAttachments);

// Delete attachments
router.delete("/delete/:id/:fileName", petSitterController.deleteAttachments);

export default router;
