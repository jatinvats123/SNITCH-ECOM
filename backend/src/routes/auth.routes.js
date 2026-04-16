import {Router} from "express";
import {validateRegisterUser} from "../validator/auth.validator.js";
import {regitser} from "../controller/auth.controller.js";
const router = Router();




router.post("/register", validateRegisterUser, regitser);


export default router;