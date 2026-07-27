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

// Atomically decrement variant stock for every line item, as part of the order
// transaction. The guard `stock: { $gte: quantity }` is what actually prevents
// overselling: the decrement only matches while enough stock remains, so if two
// checkouts race for the last unit exactly one update matches — the other sees
// `modifiedCount === 0` and throws, rolling back the whole transaction. Under a
// replica set a concurrent decrement instead surfaces as a write conflict that
// `withTransaction` retries, after which the same guard rejects the loser.
//
// Product-level items (no variant) carry no per-variant stock and are skipped.
const decrementStockOrThrow = async (items, session) => {
  for (const item of items) {
    if (!item.variant) continue;
    const result = await productModel.updateOne(
      {
        _id: item.product,
        variants: {
          $elemMatch: {
            // Order items key variants by variantId (see buildOrderItems); match
            // _id too so any legacy/product-level keying still resolves.
            $or: [{ variantId: item.variant }, { _id: item.variant }],
            stock: { $gte: item.quantity },
          },
        },
      },
      { $inc: { "variants.$.stock": -item.quantity } },
      { session },
    );
    if (result.modifiedCount !== 1) {
      throw AppError.conflict(`Not enough stock to fulfil "${item.title}"`, "INSUFFICIENT_STOCK");
    }
  }
};

// Create the order transactionally as part of a verified payment. In one
// transaction it decrements stock for every line item, inserts the order and
// clears the cart — so a paid order and its inventory move are all-or-nothing.
// Idempotent: a repeat verify for the same razorpayOrderId returns the order
// already created without decrementing stock again.
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
      // Reserve inventory first: if any item is short this throws and the whole
      // transaction (order insert + cart clear) rolls back — nothing persists.
      await decrementStockOrThrow(items, session);
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
