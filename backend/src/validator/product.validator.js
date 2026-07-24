import { body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";

function getVariantPriceField(req, field) {
  return req.body?.price?.[field] ?? req.body?.[`price.${field}`] ?? req.body?.[`price[${field}]`];
}

export const createProductValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("priceAmount")
    .notEmpty()
    .withMessage("Price amount is required")
    .isNumeric()
    .withMessage("Price amount must be a number"),
  body("priceCurrency")
    .notEmpty()
    .withMessage("Price currency is required")
    .isString()
    .withMessage("Price currency must be a string"),
  validate,
];

export const createVariantValidator = [
  body("price").custom((_, { req }) => {
    const priceAmount = getVariantPriceField(req, "amount");
    if (priceAmount === undefined || priceAmount === "") {
      throw new Error("Price amount is required");
    }
    if (Number.isNaN(Number(priceAmount))) {
      throw new Error("Price amount must be a number");
    }
    return true;
  }),
  body("price").custom((_, { req }) => {
    const priceCurrency = getVariantPriceField(req, "currency");
    if (!priceCurrency) {
      throw new Error("Price currency is required");
    }
    if (typeof priceCurrency !== "string") {
      throw new Error("Price currency must be a string");
    }
    return true;
  }),
  body("stock").optional().isNumeric().withMessage("Stock must be a number"),
  validate,
];
