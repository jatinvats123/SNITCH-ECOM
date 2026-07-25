import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import { connectDB, clearDB, disconnectDB } from "./setup/db.js";
import { registerUser, registerSeller, createProduct, makeVariant } from "./factories/index.js";
import app from "../src/app.js";
import cartModel from "../src/models/cartModel.js";

let seller, buyer, product, variantId;

beforeAll(connectDB);
beforeEach(async () => {
  const stamp = `${Date.now()}${Math.random().toString(36).slice(2)}`;
  seller = await registerSeller(app, { email: `s_${stamp}@test.com` });
  buyer = await registerUser(app, { email: `b_${stamp}@test.com` });
  product = await createProduct(seller.user.id, {
    variants: [makeVariant({ stock: 10, amount: 500 })],
  });
  variantId = product.variants[0].variantId.toString();
});
afterEach(clearDB);
afterAll(disconnectDB);

const add = (cookie, quantity = 1) =>
  request(app)
    .post(`/api/cart/add/${product._id}`)
    .set("Cookie", cookie)
    .send({ variantId, quantity });

const rawItemCount = async (userId) => {
  const cart = await cartModel.findOne({ user: userId });
  return cart ? cart.items.length : 0;
};

describe("cart", () => {
  it("adds a variant to the cart", async () => {
    const res = await add(buyer.cookie, 2);
    expect(res.status).toBe(200);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it("returns 404 adding a product that does not exist", async () => {
    const res = await request(app)
      .post("/api/cart/add/507f1f77bcf86cd799439011")
      .set("Cookie", buyer.cookie)
      .send({ quantity: 1 });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("rejects a quantity beyond available stock", async () => {
    const res = await add(buyer.cookie, 999);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INSUFFICIENT_STOCK");
  });

  it("increments an existing line item when the same variant is re-added", async () => {
    await add(buyer.cookie, 1);
    const res = await add(buyer.cookie, 1);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it("increments quantity via the increment endpoint", async () => {
    await add(buyer.cookie, 1);
    const res = await request(app)
      .patch(`/api/cart/quantity/increament/${product._id}/${variantId}`)
      .set("Cookie", buyer.cookie);
    expect(res.status).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it("removes the line item when decremented to zero", async () => {
    await add(buyer.cookie, 1);
    const res = await request(app)
      .patch(`/api/cart/quantity/decrement/${product._id}/${variantId}`)
      .set("Cookie", buyer.cookie);
    expect(res.status).toBe(200);
    expect(await rawItemCount(buyer.user.id)).toBe(0);
  });

  it("decrements without removing when quantity is above one", async () => {
    await add(buyer.cookie, 3);
    const res = await request(app)
      .patch(`/api/cart/quantity/decrement/${product._id}/${variantId}`)
      .set("Cookie", buyer.cookie);
    expect(res.status).toBe(200);
    expect(res.body.cart.items[0].quantity).toBe(2);
  });

  it("removes a line item via the remove endpoint", async () => {
    await add(buyer.cookie, 2);
    const res = await request(app)
      .delete(`/api/cart/remove/${product._id}/${variantId}`)
      .set("Cookie", buyer.cookie);
    expect(res.status).toBe(200);
    expect(await rawItemCount(buyer.user.id)).toBe(0);
  });

  it("keeps carts isolated between two users", async () => {
    const other = await registerUser(app, { email: `other_${Date.now()}@test.com` });
    await add(buyer.cookie, 1);

    const otherCart = await request(app).get("/api/cart").set("Cookie", other.cookie);
    expect(otherCart.status).toBe(200);
    expect(otherCart.body.cart.items ?? []).toHaveLength(0);

    expect(await rawItemCount(buyer.user.id)).toBe(1);
    expect(await rawItemCount(other.user.id)).toBe(0);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
  });
});
