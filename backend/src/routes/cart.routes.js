import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCart } from '../controller/cart.controller.js';
import { getCart } from '../controller/cart.controller.js';
import { incrementCartItemQuantity } from '../controller/cart.controller.js';
import { decrementCartItemQuantity } from '../controller/cart.controller.js';
import { removeCartItem } from '../controller/cart.controller.js';
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


// patch api/cart/quantity/increament/:productId/:variantId
// desc update cart item quantity by incrementing it by 1
router.patch("/quantity/increament/:productId/:variantId", authenticateUser,incrementCartItemQuantity);

// patch api/cart/quantity/decrement/:productId/:variantId
// desc update cart item quantity by decrementing it by 1
router.patch("/quantity/decrement/:productId/:variantId", authenticateUser,decrementCartItemQuantity);
router.patch("/quantity/decrement/:productId", authenticateUser,decrementCartItemQuantity);

// delete api/cart/remove/:productId
// delete api/cart/remove/:productId/:variantId
// desc remove item from cart
router.delete("/remove/:productId", authenticateUser, removeCartItem);
router.delete("/remove/:productId/:variantId", authenticateUser, removeCartItem);

export default router;