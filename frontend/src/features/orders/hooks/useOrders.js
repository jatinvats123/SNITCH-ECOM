import { getMyOrders, getOrderById, getSellerOrders } from "../service/order.api";

export const useOrders = () => {
  const handleGetMyOrders = async () => {
    const data = await getMyOrders();
    return data.orders;
  };

  const handleGetOrderById = async (orderId) => {
    const data = await getOrderById(orderId);
    return data.order;
  };

  const handleGetSellerOrders = async () => {
    const data = await getSellerOrders();
    return data.orders;
  };

  return { handleGetMyOrders, handleGetOrderById, handleGetSellerOrders };
};
