import express from "express";
import * as userController from "../controllers/users";

const router = express.Router();
router.get("/", userController.getUsers);

router.get("/:userId", userController.getUser);

//logout
router.post("/logout", userController.logout);
export default router;
