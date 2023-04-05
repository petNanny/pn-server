import express from "express";
import * as adminController from "../controllers/admin";
import { loginLimiter } from "../middleware/loginLimiter";

const router = express.Router();

//sign up
router.post("/register", adminController.adminRegister);
//login
router.post("/login", loginLimiter, adminController.adminLogin);
//refresh
router.get("/refresh_token", adminController.adminRefreshToken);
//logout
router.post("/logout", adminController.adminLogout);

export default router;