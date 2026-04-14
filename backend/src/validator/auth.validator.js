import {body,validationResult} from "express-validator";


function validateRequest(req,res,next){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    next();

}


export const validateRegisterUser = [
    body("email")
    .isEmail().withMessage("Invalid email format"),
    body("contact")
    .notEmpty().withMessage("contact is required")
    .matches(/^\d{10}$/ ).withMessage("contact must be a 10-digit number"),
    body("password")
    .isLength({min:6}).withMessage("Password must be at least 6 characters long"),
    body("fullName")
    .notEmpty().withMessage("Full name is required")
    .length({min:3}).withMessage("Full name must be at least 3 characters long"),

    validateRequest
]