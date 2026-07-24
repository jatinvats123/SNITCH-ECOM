import { param, body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";

export const validateAddToCart = [
  param("productId").isMongoId().withMessage("Invalid product ID"),
  body("variantId").optional().isMongoId().withMessage("Invalid variant ID"),
  body("quantity").optional().isNumeric().withMessage("Quantity must be a number"),
  validate,
];
export const validateIncrementCartItemQuantity = [
  param("productId").isMongoId().withMessage("Invalid product ID"),
  param("variantId").optional().isMongoId().withMessage("Invalid variant ID"),
  validate,
];
