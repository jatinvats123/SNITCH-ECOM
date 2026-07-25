import mongoose from "mongoose";
import request from "supertest";
import productModel from "../../src/models/productModel.js";
import orderModel from "../../src/models/orderModel.js";

let seq = 0;
const uniq = () => `${Date.now().toString(36)}${(seq++).toString(36)}`;

// Register a user through the real API so the password is hashed and an auth cookie
// is issued. Returns the parsed user plus the Set-Cookie value to reuse on later
// authenticated requests.
export async function registerUser(app, overrides = {}) {
  const id = uniq();
  const body = {
    email: overrides.email ?? `user_${id}@test.com`,
    // Unique 10-digit contact per user so registering several users in one test
    // does not collide on the unique-contact check.
    contact: overrides.contact ?? String(1000000000 + Math.floor(Math.random() * 9000000000)),
    password: overrides.password ?? "password123",
    fullname: overrides.fullname ?? "Test User",
    isSeller: overrides.isSeller ?? false,
  };
  const res = await request(app).post("/api/auth/register").send(body);
  return { res, body, cookie: res.headers["set-cookie"], user: res.body.user };
}

export function registerSeller(app, overrides = {}) {
  return registerUser(app, { ...overrides, isSeller: true });
}

// Build a variant subdocument. Its _id is what the cart/stock lookups match on.
export function makeVariant(overrides = {}) {
  return {
    _id: overrides._id ?? new mongoose.Types.ObjectId(),
    title: overrides.title ?? "Variant",
    description: overrides.description ?? "A variant",
    price: { amount: overrides.amount ?? 999, currency: "INR" },
    images: overrides.images ?? [{ url: "https://ik.imagekit.io/test/v.png" }],
    attributes: overrides.attributes ?? { Size: "M" },
    stock: overrides.stock ?? 10,
    variantId: overrides.variantId ?? new mongoose.Types.ObjectId(),
  };
}

// Create a product document directly (bypasses the image-upload route) owned by the
// given seller id.
export function createProduct(sellerId, overrides = {}) {
  return productModel.create({
    title: overrides.title ?? `Product ${uniq()}`,
    description: overrides.description ?? "A test product",
    seller: sellerId,
    price: { amount: overrides.amount ?? 1000, currency: overrides.currency ?? "INR" },
    images: overrides.images ?? [{ url: "https://ik.imagekit.io/test/p.png" }],
    variants: overrides.variants ?? [],
  });
}

// Create a paid order document directly, for order read/authorization tests that
// don't need to exercise the whole payment flow.
export function createOrder(userId, overrides = {}) {
  const items = overrides.items ?? [
    {
      product: overrides.productId ?? new mongoose.Types.ObjectId(),
      title: overrides.title ?? "An item",
      quantity: overrides.quantity ?? 1,
      price: { amount: overrides.amount ?? 1000, currency: "INR" },
    },
  ];
  return orderModel.create({
    user: userId,
    items,
    subtotal: overrides.subtotal ?? 100000,
    tax: overrides.tax ?? 18000,
    amount: overrides.amountTotal ?? 118000,
    currency: "INR",
    status: overrides.status ?? "paid",
    razorpayOrderId: overrides.razorpayOrderId ?? `order_${uniq()}`,
    paidAt: new Date(),
  });
}
