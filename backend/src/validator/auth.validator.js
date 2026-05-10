import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    next();
}

export const validateRegisterUser = [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("contact")
    .isString()
    .withMessage("Contact must be string")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact must be 10 digits"),

  body("password")
    .isString()
    .withMessage("Password must be string")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("fullname")
    .isString()
    .withMessage("Fullname must be string")
    .notEmpty()
    .withMessage("Fullname is required"),
    body("isSeller")
    .isBoolean()
    .withMessage("isSeller must be a boolean"),
    
  validateRequest
];
export const validateLoginUser = [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isString()
    .withMessage("Password must be string"),
    
  validateRequest
];