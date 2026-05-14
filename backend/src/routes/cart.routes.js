import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCart } from '../controller/cart.controller.js';
import { getCart } from '../controller/cart.controller.js';
const router = express.Router();

// add item to cart 
// @route POST /api/cart/add/:productId/:variantId
// acess Private (authenticated users only)
// arguments productId, variantId in params and quantity in body
// argument quantity is optional and defaults to 1 if not provided
router.post("/add/:productId", authenticateUser,validateAddToCart, addToCart);
// get cart details
// @route GET /api/cart/
// acess Private (authenticated users only)
router.get("/",authenticateUser,getCart)

export default router;