import express from "express";
import * as authController from "../controllers/auth";
import { loginLimiter } from "../middleware/loginLimiter";
import { verifyJWT } from "../middleware/verifyJWT";

const router = express.Router();

//sign up
router.post("/register", authController.register);
//login
router.post("/login", loginLimiter, authController.login);
//refresh
router.get("/refresh_token", authController.refreshToken);
// verify
router.get("/verify/:userId/:token/", authController.verifyEmail);
// google login
router.post("/google", authController.googleLogin);

export default router;
