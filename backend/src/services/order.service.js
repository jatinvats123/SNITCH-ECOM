import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import { getCartWithTotals } from "../dao/cart.dao.js";
import * as orderDao from "../dao/order.dao.js";
import { AppError } from "../utils/AppError.js";

// Estimated tax applied at checkout — mirrors the "Tax (estimated)" line on the cart.
const TAX_RATE = 0.18;

// Build the persisted line-item snapshot from the aggregated cart. Items whose
// product was deleted (product === null after the lookup) are skipped.
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

// Buyer: list my orders (newest first).
export const getMyOrders = (userId) => orderDao.findOrdersByUser(userId);

// Buyer: a single order I own.
export const getMyOrderById = async (orderId, userId) => {
  const order = await orderDao.findOrderByIdForUser(orderId, userId);
  if (!order) throw AppError.notFound("Order not found", "ORDER_NOT_FOUND");
  return order;
};

// Seller: orders containing at least one of my products. Each returned order's
// line items are filtered down to this seller's own products so one seller never
// sees another seller's items.
export const getSellerOrders = async (sellerId) => {
  const products = await productModel.find({ seller: sellerId }).select("_id").lean();
  const productIds = products.map((p) => p._id);
  if (productIds.length === 0) return [];

  const orders = await orderDao.findOrdersContainingProducts(productIds);
  const owned = new Set(productIds.map((id) => id.toString()));
  return orders.map((order) => ({
    ...order,
    items: order.items.filter((it) => it.product && owned.has(it.product.toString())),
  }));
};

// Create the order transactionally as part of a verified payment, clearing the
// cart in the same transaction. Idempotent: a repeat verify for the same
// razorpayOrderId returns the order already created.
export const createPaidOrder = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  chargedAmount,
}) => {
  const existing = await orderModel.findOne({ razorpayOrderId });
  if (existing) return existing;

  const cart = await getCartWithTotals(userId);
  const items = cart?.items?.length ? buildOrderItems(cart) : [];
  if (items.length === 0) {
    throw AppError.badRequest("Cart has no purchasable items", "EMPTY_CART");
  }

  const currency = cart.currency || "INR";
  const subtotal = Math.round(cart.totalPrice * 100); // paise
  const tax = Math.round(subtotal * TAX_RATE);
  // Prefer the authoritative amount actually charged by Razorpay; fall back to the
  // server-computed total if it could not be fetched.
  const amount = chargedAmount ?? subtotal + tax;

  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      const [created] = await orderModel.create(
        [
          {
            user: userId,
            items,
            subtotal,
            tax,
            amount,
            currency,
            status: "paid",
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            paidAt: new Date(),
          },
        ],
        { session },
      );
      order = created;
      await cartModel.updateOne({ user: userId }, { $set: { items: [] } }, { session });
    });
    return order;
  } finally {
    await session.endSession();
  }
};
