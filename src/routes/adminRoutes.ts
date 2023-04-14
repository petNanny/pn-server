import express from "express";
import * as adminController from "../controllers/admin";
import { loginLimiter } from "../middleware/loginLimiter";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

//sign up
router.post("/register", adminController.adminRegister);
//login
router.post("/login", loginLimiter, adminController.adminLogin);
//refresh
router.get("/refresh_token", adminController.adminRefreshToken);
//logout
router.post("/logout", adminController.adminLogout);
//get admin
router.get("/:id", verifyJWT, adminController.getAdmin);

export default router;
