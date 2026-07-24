import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as orderService from "../services/order.service.js";

// GET /api/orders — the authenticated buyer's own order history.
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user._id);
  return sendSuccess(res, 200, "Orders fetched successfully", { orders });
});

// GET /api/orders/seller — orders containing the authenticated seller's products.
export const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getSellerOrders(req.user._id);
  return sendSuccess(res, 200, "Seller orders fetched successfully", { orders });
});

// GET /api/orders/:orderId — a single order the authenticated buyer owns.
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getMyOrderById(req.params.orderId, req.user._id);
  return sendSuccess(res, 200, "Order fetched successfully", { order });
});
