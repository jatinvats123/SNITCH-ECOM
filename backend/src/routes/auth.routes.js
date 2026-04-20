import {Router} from "express";
import {validateRegisterUser, validateLoginUser} from "../validator/auth.validator.js";
import {regitser, login, googleCallBack} from "../controller/auth.controller.js";
import passport from "passport";
const router = Router();




router.post("/register", validateRegisterUser, regitser);
router.post("/login", validateLoginUser, login );
router.get("/google", passport.authenticate("google",{scope:["profile","email"]}))

router.get("/google/callback", passport.authenticate("google",{session:false,failureRedirect:"http://localhost:5173/login"}),
googleCallBack)


export default router;