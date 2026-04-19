import { body } from "express-validator";

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
    .withMessage("isSeller must be a boolean")

];
export const validateLoginUser = [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isString()
    .withMessage("Password must be string")
   
];