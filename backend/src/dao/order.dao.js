import orderModel from "../models/orderModel.js";

// Read-only query layer for orders. Uses .lean() since callers only read.

// A user's orders, newest first (buyer order history).
export const findOrdersByUser = (userId) =>
  orderModel.find({ user: userId }).sort({ createdAt: -1 }).lean();

// A single order that belongs to the given user (ownership enforced in the query).
export const findOrderByIdForUser = (orderId, userId) =>
  orderModel.findOne({ _id: orderId, user: userId }).lean();

// Orders containing at least one of the given product ids (seller order view).
export const findOrdersContainingProducts = (productIds) =>
  orderModel
    .find({ "items.product": { $in: productIds } })
    .sort({ createdAt: -1 })
    .lean();
