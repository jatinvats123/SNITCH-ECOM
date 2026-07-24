import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import { config } from "../config/config.js";
import { getCartWithTotals } from "../dao/cart.dao.js";
import { createPaidOrder } from "../services/order.service.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

// Estimated tax applied at checkout — mirrors the "Tax (estimated)" line on the cart.
const TAX_RATE = 0.18;

// POST /api/payment/create-order
// Creates a Razorpay order for the current user's cart. The amount is computed on
// the server from the cart — never trusted from the client. No local order is
// persisted here; our order is created only after the payment is verified.
export const createOrder = asyncHandler(async (req, res) => {
  const cart = await getCartWithTotals(req.user._id);
  if (!cart || !cart.items?.length) {
    throw AppError.badRequest("Your cart is empty", "EMPTY_CART");
  }

  const currency = cart.currency || "INR";
  // Work in the smallest currency unit (paise) to match Razorpay and avoid float drift.
  const subtotal = Math.round(cart.totalPrice * 100);
  const tax = Math.round(subtotal * TAX_RATE);
  const amount = subtotal + tax;

  const razorpayOrder = await razorpay.orders.create({
    amount, // in paise
    currency,
    receipt: `rcpt_${Date.now()}`,
    notes: {
      userId: req.user._id.toString(),
      subtotal: String(subtotal),
      tax: String(tax),
    },
  });

  return sendSuccess(res, 201, "Order created successfully", {
    key: config.RAZORPAY_KEY_ID, // publishable key — safe to send to the client
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency,
  });
});

// POST /api/payment/verify
// Verifies the Razorpay signature server-side. On success it creates the order
// transactionally and clears the cart — the order only ever exists in our DB after
// a cryptographically verified, successful payment.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw AppError.badRequest("Missing payment verification fields", "MISSING_PAYMENT_FIELDS");
  }

  // signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
  const expectedSignature = crypto
    .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const providedBuffer = Buffer.from(razorpay_signature, "utf8");
  const isValid =
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer);

  if (!isValid) {
    throw AppError.badRequest("Payment verification failed", "INVALID_SIGNATURE");
  }

  // The signature proves the order/payment came from Razorpay. Fetch the order to
  // get the authoritative amount actually charged (best-effort; the service falls
  // back to the server-computed total if the fetch fails).
  let chargedAmount;
  try {
    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    chargedAmount = razorpayOrder?.amount;
  } catch {
    chargedAmount = undefined;
  }

  const order = await createPaidOrder({
    userId: req.user._id,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    chargedAmount,
  });

  return sendSuccess(res, 200, "Payment verified successfully", { orderId: order._id });
});

// POST /api/payment/failure
// Records a failed / cancelled payment attempt. Because no order is persisted until
// a payment is verified, this simply logs the attempt for observability.
export const paymentFailed = asyncHandler(async (req, res) => {
  const { razorpay_order_id, reason } = req.body;
  req.log?.warn(
    { razorpayOrderId: razorpay_order_id, reason, userId: req.user._id.toString() },
    "Payment failed or cancelled",
  );
  return sendSuccess(res, 200, "Payment failure recorded");
});
