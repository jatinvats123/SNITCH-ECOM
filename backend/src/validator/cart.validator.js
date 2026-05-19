import {param,body,validationResult} from "express-validator";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    next();
}



export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    body("variantId").optional().isMongoId().withMessage("Invalid variant ID"),
    body("quantity").optional().isNumeric().withMessage("Quantity must be a number"),
    validateRequest
]   
export const validateIncrementCartItemQuantity = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    param("variantId").optional().isMongoId().withMessage("Invalid variant ID"),
    validateRequest
]