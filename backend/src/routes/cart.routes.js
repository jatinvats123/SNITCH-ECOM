import express from 'express';
import authenticateuser from '../middleware/auth.middleware.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCart } from '../controller/cart.controller.js';
const router = express.Router();

// add item to cart 
// @route POST /api/cart/add/:productId/:variantId
// acess Private (authenticated users only)
// arguments productId, variantId in params and quantity in body
// argument quantity is optional and defaults to 1 if not provided
router.post("/add/:productId/:variantId", authenticateuser,validateAddToCart, addToCart);

export default router;