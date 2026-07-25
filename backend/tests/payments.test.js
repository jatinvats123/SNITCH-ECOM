import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from "@jest/globals";
import request from "supertest";
import crypto from "crypto";
import { connectDB, clearDB, disconnectDB } from "./setup/db.js";
import { registerUser, registerSeller, createProduct, makeVariant } from "./factories/index.js";

// Mock the Razorpay SDK — the real API is never called in tests.
const ordersCreate = jest.fn();
const ordersFetch = jest.fn();
jest.unstable_mockModule("../src/config/razorpay.js", () => ({
  razorpay: { orders: { create: ordersCreate, fetch: ordersFetch } },
}));

const { default: app } = await import("../src/app.js");
const { default: orderModel } = await import("../src/models/orderModel.js");
const { default: cartModel } = await import("../src/models/cartModel.js");

const RZP_SECRET = process.env.RAZORPAY_KEY_SECRET;
const sign = (orderId, paymentId) =>
  crypto.createHmac("sha256", RZP_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

let buyer, product, variantId;
beforeAll(connectDB);
beforeEach(async () => {
  ordersCreate.mockReset();
  ordersFetch.mockReset();
  const stamp = `${Date.now()}${Math.random().toString(36).slice(2)}`;
  const seller = await registerSeller(app, { email: `s_${stamp}@test.com` });
  buyer = await registerUser(app, { email: `b_${stamp}@test.com` });
  product = await createProduct(seller.user.id, {
    variants: [makeVariant({ stock: 10, amount: 500 })],
  });
  variantId = product.variants[0].variantId.toString();
});
afterEach(clearDB);
afterAll(disconnectDB);

const addToCart = () =>
  request(app)
    .post(`/api/cart/add/${product._id}`)
    .set("Cookie", buyer.cookie)
    .send({ variantId, quantity: 2 });

describe("payments: create order", () => {
  it("creates a Razorpay order from the cart and returns the publishable key + server-computed amount", async () => {
    await addToCart();
    ordersCreate.mockResolvedValue({ id: "order_test123", amount: 118000, currency: "INR" });

    const res = await request(app).post("/api/payment/create-order").set("Cookie", buyer.cookie);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      razorpayOrderId: "order_test123",
      currency: "INR",
    });
    expect(res.body.key).toBe(process.env.RAZORPAY_KEY_ID);
    // 2 x 500 = 1000 (rupees) -> 100000 paise + 18% tax = 118000
    expect(res.body.amount).toBe(118000);
    expect(ordersCreate).toHaveBeenCalledTimes(1);
  });

  it("rejects create-order with an empty cart → 400 EMPTY_CART, without calling Razorpay", async () => {
    const res = await request(app).post("/api/payment/create-order").set("Cookie", buyer.cookie);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("EMPTY_CART");
    expect(ordersCreate).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/payment/create-order");
    expect(res.status).toBe(401);
  });
});

describe("payments: verify signature", () => {
  const orderId = "order_verify123";
  const paymentId = "pay_verify123";

  it("creates the paid order and clears the cart when the signature is valid", async () => {
    await addToCart();
    ordersFetch.mockResolvedValue({ amount: 118000 });

    const res = await request(app)
      .post("/api/payment/verify")
      .set("Cookie", buyer.cookie)
      .send({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sign(orderId, paymentId),
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const order = await orderModel.findOne({ razorpayOrderId: orderId });
    expect(order).not.toBeNull();
    expect(order.status).toBe("paid");
    expect(order.user.toString()).toBe(buyer.user.id);
    expect(order.amount).toBe(118000);

    const cart = await cartModel.findOne({ user: buyer.user.id });
    expect(cart.items).toHaveLength(0);
  });

  it("rejects a tampered signature with 400 INVALID_SIGNATURE and creates no order", async () => {
    await addToCart();
    const res = await request(app).post("/api/payment/verify").set("Cookie", buyer.cookie).send({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: "totally-wrong-signature",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_SIGNATURE");
    expect(await orderModel.countDocuments({ razorpayOrderId: orderId })).toBe(0);
    // Nothing further is fetched from Razorpay once the signature check fails.
    expect(ordersFetch).not.toHaveBeenCalled();
  });

  it("is idempotent: verifying the same order twice yields one paid order", async () => {
    await addToCart();
    ordersFetch.mockResolvedValue({ amount: 118000 });
    const body = {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: sign(orderId, paymentId),
    };
    await request(app).post("/api/payment/verify").set("Cookie", buyer.cookie).send(body);
    const second = await request(app)
      .post("/api/payment/verify")
      .set("Cookie", buyer.cookie)
      .send(body);
    expect(second.status).toBe(200);
    expect(await orderModel.countDocuments({ razorpayOrderId: orderId })).toBe(1);
  });

  it("rejects verify with missing fields → 400 MISSING_PAYMENT_FIELDS", async () => {
    const res = await request(app)
      .post("/api/payment/verify")
      .set("Cookie", buyer.cookie)
      .send({ razorpay_order_id: orderId });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("MISSING_PAYMENT_FIELDS");
  });
});
