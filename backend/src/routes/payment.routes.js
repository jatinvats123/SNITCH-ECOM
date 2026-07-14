import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
    createOrder,
    verifyPayment,
    paymentFailed,
} from "../controller/payment.controller.js";

const router = express.Router();

// create a Razorpay order for the current user's cart
// @route POST /api/payment/create-order
// access Private (authenticated users only)
router.post("/create-order", authenticateUser, createOrder);

// verify the Razorpay payment signature and mark the order paid
// @route POST /api/payment/verify
// access Private (authenticated users only)
router.post("/verify", authenticateUser, verifyPayment);

// record a failed / cancelled payment
// @route POST /api/payment/failure
// access Private (authenticated users only)
router.post("/failure", authenticateUser, paymentFailed);

export default router;
