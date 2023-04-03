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

//User get own images by login user id
router.get("/images/:id", petSitterController.userGetOwnImages);

//User get pet sitter images by url pet sitter id
router.get("/petSitter-images/:id", petSitterController.userGetPetSitterImages);

//Upload images
router.post("/upload/:id", upload.single("file"), petSitterController.uploadAttachments);

// Delete images
router.delete("/delete/:id", petSitterController.deleteAttachments);

// update images order
router.put("/updateImages/:id", petSitterController.updateImagesOrder);

// filter pet sitter
router.post("/filter", petSitterController.filterPetSitter);

//routes for uploading legal requirement document:

//User get own legal documents by login user id
router.get("/legalDoc/:id", petSitterController.getPetSitterLegalDocs);

//Upload legal documents
router.post("/uploadLegalDoc/:id", upload.single("file"), petSitterController.uploadLegalDocs);

//remove legal documents
router.delete("/deleteLegalDoc/:id", petSitterController.deleteLegalDocs);

export default router;
