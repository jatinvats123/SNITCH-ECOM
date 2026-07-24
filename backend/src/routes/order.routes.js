import { Router } from "express";
import { param } from "express-validator";
import { authenticateUser, authenticateSeller } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { getMyOrders, getSellerOrders, getOrderById } from "../controller/order.controller.js";

const router = Router();

// @route GET /api/orders/seller
// @desc  Orders containing the authenticated seller's products
// @access Private (sellers only)
// Declared before "/:orderId" so "seller" is never captured as an order id.
router.get("/seller", authenticateSeller, getSellerOrders);

// @route GET /api/orders
// @desc  The authenticated buyer's own order history
// @access Private
router.get("/", authenticateUser, getMyOrders);

// @route GET /api/orders/:orderId
// @desc  A single order the authenticated buyer owns
// @access Private
router.get(
  "/:orderId",
  authenticateUser,
  param("orderId").isMongoId().withMessage("Invalid order ID"),
  validate,
  getOrderById,
);

export default router;
