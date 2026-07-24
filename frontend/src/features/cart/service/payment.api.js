import axios from "axios";

const paymentApiInstance = axios.create({
  baseURL: "/api/payment",
  withCredentials: true,
});

// Create a Razorpay order for the current user's cart.
// Returns { key, razorpayOrderId, orderId, amount, currency }.
export const createOrder = async () => {
  const response = await paymentApiInstance.post("/create-order");
  return response.data;
};

// Verify the payment signature on the backend after a successful Razorpay payment.
export const verifyPayment = async (payload) => {
  const response = await paymentApiInstance.post("/verify", payload);
  return response.data;
};

// Notify the backend of a failed or cancelled payment.
export const notifyPaymentFailure = async (payload) => {
  const response = await paymentApiInstance.post("/failure", payload);
  return response.data;
};
