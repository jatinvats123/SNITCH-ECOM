import {Router} from "express";
import {validateRegisterUser, validateLoginUser, validateForgotPassword, validateResetPassword} from "../validator/auth.validator.js";
import {regitser, login, googleCallBack, getMe, forgotPassword, resetPassword, logout} from "../controller/auth.controller.js";
import passport from "passport";
import { authenticateUser } from "../middleware/auth.middleware.js";
const router = Router();




router.post("/register", validateRegisterUser, regitser);
router.post("/login", validateLoginUser, login );
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", validateResetPassword, resetPassword);
router.post("/logout", logout);
router.get("/google", passport.authenticate("google",{scope:["profile","email"]}))

router.get("/google/callback", passport.authenticate("google",{session:false,failureRedirect:"http://localhost:5173/login"}),
googleCallBack)

// @route GET /api/auth/me
// @desc Get current user
// @access Private
router.get("/me",authenticateUser,getMe)

export default router;