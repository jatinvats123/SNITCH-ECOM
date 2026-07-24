import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import { config } from "../config/config.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import { getCartWithTotals } from "../dao/cart.dao.js";

// Estimated tax applied at checkout — mirrors the "Tax (estimated)" line shown on the cart page.
const TAX_RATE = 0.18;

// Build the persisted line-item snapshot from the aggregated cart.
// Items whose product was deleted (product === null after the lookup) are skipped.
const buildOrderItems = (cart) =>
  cart.items
    .filter((item) => item?.product)
    .map((item) => ({
      product: item.product._id,
      variant: item.variantKey || item.variant || null,
      title: item.product.title,
      label: item.variantSnapshot?.label || "",
      image: item.variantSnapshot?.images?.[0]?.url || item.product.images?.[0]?.url || "",
      quantity: item.quantity,
      price: item.price,
    }));

// POST /api/payment/create-order
// Creates a Razorpay order for the current user's cart and persists a matching
// "created" order in our DB. The amount is computed on the server from the cart —
// never trusted from the client.
export async function createOrder(req, res) {
  try {
    const cart = await getCartWithTotals(req.user._id);

    if (!cart || !cart.items?.length) {
      return res.status(400).json({
        message: "Your cart is empty",
        success: false,
      });
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
      notes: { userId: req.user._id.toString() },
    });

    const order = await orderModel.create({
      user: req.user._id,
      items: buildOrderItems(cart),
      subtotal,
      tax,
      amount,
      currency,
      status: "created",
      razorpayOrderId: razorpayOrder.id,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      key: config.RAZORPAY_KEY_ID, // publishable key — safe to send to the client
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id,
      amount,
      currency,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: error.message || "Error creating order",
      success: false,
    });
  }
}

// POST /api/payment/verify
// Verifies the Razorpay signature server-side. On success, marks the order paid,
// stores the payment details, and clears the user's cart.
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Missing payment verification fields",
        success: false,
      });
    }

    const order = await orderModel.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
      });
    }

    // Idempotency: a re-submitted verification for an already-paid order is a no-op success.
    if (order.status === "paid") {
      return res.status(200).json({
        message: "Payment already verified",
        success: true,
        orderId: order._id,
      });
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
      order.status = "failed";
      order.failureReason = "Signature verification failed";
      await order.save();
      return res.status(400).json({
        message: "Payment verification failed",
        success: false,
      });
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    await order.save();

    // Clear the cart now that payment is confirmed.
    await cartModel.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      message: error.message || "Error verifying payment",
      success: false,
    });
  }
}

// POST /api/payment/failure
// Records a failed or user-cancelled payment. Never overwrites an already-paid order.
export async function paymentFailed(req, res) {
  try {
    const { razorpay_order_id, reason } = req.body;

    if (razorpay_order_id) {
      await orderModel.findOneAndUpdate(
        {
          razorpayOrderId: razorpay_order_id,
          user: req.user._id,
          status: { $ne: "paid" },
        },
        {
          $set: {
            status: "failed",
            failureReason: reason || "Payment failed or cancelled by user",
          },
        },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    console.error("Error recording payment failure:", error);
    return res.status(500).json({
      message: error.message || "Error recording payment failure",
      success: false,
    });
  }
}
