import express from "express";
import * as authController from "../controllers/auth";
import { verifyJWT } from "../middleware/verifyJWT";
const passport = require('passport');
//const passportSetup = require('../util/passportSetup');

const router = express.Router();

//sign up
router.post("/register", authController.register);
//login
router.post("/login", authController.login);

//refresh
router.get("/refresh_token", authController.refreshToken);

//auth with google
router.get('/google', passport.authenticate('google',{    
    scope: [ 'profile' ]
}));

//google redirect
router.get('/google/redirectPetNanny',passport.authenticate('google'),(req,res)=>{
    //handle with passport
    res.send('here is the callback')
})

//auth logout
router.get('/logout',(req,res)=>{
    //handle with passport
    res.send('logging out');
})

export default router;
