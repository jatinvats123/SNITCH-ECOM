import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useCart } from "../hooks/useCart";
import { useNavigate } from "react-router";
import Navbar from "../../../components/Navbar";
import { createOrder, verifyPayment, notifyPaymentFailure } from "../service/payment.api";
import { loadRazorpay } from "../service/loadRazorpay";
const Cart = () => {
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  const {
    handleGetCart,
    handleIncrementCartItemQuantity,
    handleDecrementCartItemQuantity,
    handleRemoveCartItem,
  } = useCart();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    handleGetCart();
  }, []);

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      // 1. Create the order on the backend (amount is computed server-side from the cart).
      const orderData = await createOrder();
      if (!orderData?.success) {
        alert(orderData?.message || "Unable to start checkout. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 2. Open the Razorpay Checkout popup (Test Mode).
      const options = {
        key: orderData.key,
        amount: orderData.amount, // in paise, from the server
        currency: orderData.currency,
        name: "AVENIQ",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId, // generated on the server
        handler: async (response) => {
          // 3. Verify the payment signature on the backend.
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (result?.success) {
              alert("Payment successful! Your order has been placed.");
              await handleGetCart(); // refresh the cart (now empty)
            } else {
              alert(result?.message || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
          contact: user?.contact || "",
        },
        modal: {
          // User closed/cancelled the popup without paying.
          ondismiss: () => {
            notifyPaymentFailure({
              razorpay_order_id: orderData.razorpayOrderId,
              reason: "Payment cancelled by user",
            });
            setIsProcessing(false);
          },
        },
        theme: {
          color: "#000000",
        },
      };

      // Make sure Razorpay's Checkout script is loaded before opening the popup.
      const RazorpayCheckout = await loadRazorpay();
      const razorpayInstance = new RazorpayCheckout(options);

      // Explicit payment failure reported by Razorpay.
      razorpayInstance.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        notifyPaymentFailure({
          razorpay_order_id: orderData.razorpayOrderId,
          reason: response.error?.description,
        });
        alert("Payment failed. Please try again.");
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (error) {
      // Surface the real reason (network error, blocked script, backend message, ...)
      console.error("Checkout error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong during checkout. Please try again.";
      alert(message);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const initialQuantities = {};
      cartItems.forEach((item) => {
        initialQuantities[item._id] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [cartItems]);

  const formatPrice = (amount, currency) => {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${amount?.toLocaleString("en-IN") || 0}`;
  };

  const getVariantLabel = (item) => {
    const rawAttributes = item.variant?.attributes || item.variantSnapshot?.attributes;
    const variantAttributes =
      rawAttributes instanceof Map ? Object.fromEntries(rawAttributes.entries()) : rawAttributes;
    const labelFromAttributes = variantAttributes
      ? Object.entries(variantAttributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(" / ")
      : "";

    return item.variantSnapshot?.label || labelFromAttributes || item.variant?.title || "";
  };

  const getItemImage = (item) =>
    item.variant?.images?.[0]?.url ||
    item.variantSnapshot?.images?.[0]?.url ||
    item.product?.images?.[0]?.url;

  const getItemVariantKey = (item) =>
    item.variantKey ||
    item.variant?.variantId ||
    item.variant?.variantId?._id ||
    item.variant?._id ||
    item.variant;

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price?.amount * item.quantity || 0);
    }, 0);
  };

  const handleIncrement = (item) => {
    const variantId = getItemVariantKey(item);
    setQuantities((prev) => ({
      ...prev,
      [item._id]: (prev[item._id] || 1) + 1,
    }));
    handleIncrementCartItemQuantity(item.product._id, variantId);
  };

  const handleRemove = (item) => {
    const variantId = getItemVariantKey(item);
    handleRemoveCartItem(item.product._id, variantId);
  };

  const handleDecrement = async (item) => {
    const variantId = getItemVariantKey(item);
    const currentQuantity = quantities[item._id] || item.quantity || 1;

    if (currentQuantity <= 1) {
      await handleRemoveCartItem(item.product._id, variantId);
      return;
    }

    await handleDecrementCartItemQuantity(item.product._id, variantId);
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f3] text-black">
        <Navbar variant="light" />
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
          <div className="flex flex-col items-center justify-center gap-8 py-24">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.28em] text-black mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-sm text-black/60 mb-8">Start adding items to your collection</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 border border-black bg-black text-white text-[11px] font-medium uppercase tracking-[0.35em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-black">
      <Navbar variant="light" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_42%)]" />

      <main className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-3xl sm:text-4xl font-light uppercase tracking-[0.28em] text-black mb-2">
            Shopping Cart
          </h1>
          <p className="text-sm text-black/60">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="relative border border-black/10 rounded-lg p-6 bg-white/50 backdrop-blur-sm hover:border-black/20 transition-all duration-300"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="shrink-0">
                      <div className="w-24 h-32 sm:w-32 sm:h-40 bg-[#f0ede7] rounded-lg overflow-hidden">
                        <img
                          src={getItemImage(item) || "https://placehold.co/300x400/f7f7f7/cccccc"}
                          alt={item.product?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="pr-20 sm:pr-0">
                        <h3 className="text-lg sm:text-xl font-medium text-black mb-2 line-clamp-2">
                          {item.product?.title}
                        </h3>
                        {getVariantLabel(item) && (
                          <p className="text-[10px] uppercase tracking-[0.25em] text-black/45 mb-3">
                            {getVariantLabel(item)}
                          </p>
                        )}
                        <p className="text-sm text-black/60 mb-4 line-clamp-2">
                          {item.product?.description}
                        </p>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-0">
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-[0.25em] text-black/50 mb-2 block">
                              Quantity
                            </label>
                            <div className="flex items-center border border-black/15 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleDecrement(item)}
                                className="px-3 py-2 hover:bg-black/5 transition-colors text-black/70 hover:text-black font-medium"
                              >
                                −
                              </button>
                              <div className="px-4 py-2 border-l border-r border-black/15 text-center min-w-10">
                                {quantities[item._id] || item.quantity}
                              </div>
                              <button
                                onClick={() => handleIncrement(item)}
                                className="px-3 py-2 hover:bg-black/5 transition-colors text-black/70 hover:text-black font-medium"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-black/50 mb-1">
                            Total
                          </p>
                          <p className="text-xl sm:text-2xl font-semibold text-black">
                            {formatPrice(
                              item.price?.amount * (quantities[item._id] || item.quantity),
                              item.price?.currency,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="absolute right-4 top-4 sm:static flex flex-col justify-start">
                      <button
                        onClick={() => handleRemove(item)}
                        className="text-[10px] uppercase tracking-[0.25em] text-red-600 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-black/10 rounded-lg p-8 bg-white/50 backdrop-blur-sm">
              <h2 className="text-lg font-medium uppercase tracking-[0.28em] text-black mb-8">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8 border-b border-black/10 pb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-black/70">Subtotal</span>
                  <span className="font-medium">{formatPrice(total, "INR")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black/70">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black/70">Tax (estimated)</span>
                  <span className="font-medium">{formatPrice(total * 0.18, "INR")}</span>
                </div>
              </div>

              <div className="mb-8 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-black/50">
                  Total Amount
                </span>
                <div className="text-right">
                  <p className="text-3xl font-semibold text-black">
                    {formatPrice(total * 1.18, "INR")}
                  </p>
                </div>
              </div>

              <button
                className="w-full py-4 bg-black text-white text-[11px] font-medium uppercase tracking-[0.35em] hover:bg-black/90 transition-all duration-300 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing…" : "Proceed to Checkout"}
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border border-black/30 text-black text-[11px] font-medium uppercase tracking-[0.35em] hover:bg-black/5 transition-all duration-300"
              >
                Continue Shopping
              </button>

              {/* Trust Badges */}
              <div className="mt-8 pt-8 border-t border-black/10 space-y-3">
                {["✓ Secure checkout", "✓ 30-day returns", "✓ Free shipping"].map((badge) => (
                  <p key={badge} className="text-[10px] uppercase tracking-[0.22em] text-black/60">
                    {badge}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
