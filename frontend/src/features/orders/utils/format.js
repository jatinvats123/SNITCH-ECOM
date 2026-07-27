// Order monetary totals (subtotal/tax/amount) are stored in paise; line-item
// unit prices are in catalog units (rupees). Helpers here keep the two straight.

export const formatMoney = (amount, currency = "INR") => {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${(amount ?? 0).toLocaleString("en-IN")}`;
};

// Paise -> display currency.
export const formatPaise = (paise, currency = "INR") => formatMoney((paise ?? 0) / 100, currency);

// A seller's revenue for an order = sum of its line items. The API already scopes
// each order's items to the seller, and item unit prices are in catalog units
// (rupees), not the paise used for order-level totals.
export const sellerOrderTotal = (order) =>
  (order.items || []).reduce(
    (sum, item) => sum + (item.price?.amount || 0) * (item.quantity || 0),
    0,
  );

export const formatOrderDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export const STATUS_STYLES = {
  paid: "bg-green-100 text-green-700",
  created: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};
