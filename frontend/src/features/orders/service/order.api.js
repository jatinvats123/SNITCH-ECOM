import axios from "axios";

const orderApiInstance = axios.create({
  baseURL: "/api/orders",
  withCredentials: true,
});

// Buyer order history.
export async function getMyOrders() {
  const response = await orderApiInstance.get("");
  return response.data;
}

// Single order the buyer owns.
export async function getOrderById(orderId) {
  const response = await orderApiInstance.get(`/${orderId}`);
  return response.data;
}

// Orders that contain the authenticated seller's products. The server scopes each
// order's line items down to that seller's own products.
export async function getSellerOrders() {
  const response = await orderApiInstance.get("/seller");
  return response.data;
}
