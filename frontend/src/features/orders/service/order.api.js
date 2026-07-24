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
