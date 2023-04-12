import express from "express";
import * as petOwnerController from "../controllers/petOwner";
import { verifyJWT } from "../middleware/verifyJWT";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/:id", petOwnerController.getPetOwner);
router.patch("/:id", petOwnerController.updatePetOwner);
router.patch("/deletePetOwner/:id", petOwnerController.deletePetOwner);
router.post("/uploadAvatar/:id", upload.single("avatar"), petOwnerController.uploadAvatar);

router.post("/logout", petOwnerController.logout);
export default router;
