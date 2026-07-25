import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import { connectDB, clearDB, disconnectDB } from "./setup/db.js";
import { registerUser, registerSeller, createProduct, makeVariant } from "./factories/index.js";
import app from "../src/app.js";

let buyer, sellerA, sellerB;
beforeAll(connectDB);
beforeEach(async () => {
  const s = `${Date.now()}${Math.random().toString(36).slice(2)}`;
  buyer = await registerUser(app, { email: `buyer_${s}@test.com` });
  sellerA = await registerSeller(app, { email: `sa_${s}@test.com` });
  sellerB = await registerSeller(app, { email: `sb_${s}@test.com` });
});
afterEach(clearDB);
afterAll(disconnectDB);

describe("rbac: buyer blocked from seller-only routes", () => {
  it("buyer POST /api/products → 403 NOT_A_SELLER", async () => {
    const res = await request(app).post("/api/products").set("Cookie", buyer.cookie).send({});
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_A_SELLER");
  });

  it("buyer GET /api/products/seller → 403", async () => {
    const res = await request(app).get("/api/products/seller").set("Cookie", buyer.cookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_A_SELLER");
  });

  it("buyer GET /api/orders/seller → 403", async () => {
    const res = await request(app).get("/api/orders/seller").set("Cookie", buyer.cookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_A_SELLER");
  });
});

describe("rbac: a seller cannot touch another seller's product (ownership)", () => {
  it("seller B cannot delete seller A's product → 403 NOT_OWNER (and it survives)", async () => {
    const product = await createProduct(sellerA.user.id);
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Cookie", sellerB.cookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_OWNER");

    const check = await request(app).get(`/api/products/detail/${product._id}`);
    expect(check.status).toBe(200);
  });

  it("seller B cannot delete a variant on seller A's product → 403", async () => {
    const product = await createProduct(sellerA.user.id, { variants: [makeVariant()] });
    const variantId = product.variants[0]._id.toString();
    const res = await request(app)
      .delete(`/api/products/${product._id}/variants/${variantId}`)
      .set("Cookie", sellerB.cookie);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_OWNER");
  });

  it("seller B cannot add a variant to seller A's product → 403", async () => {
    const product = await createProduct(sellerA.user.id);
    const res = await request(app)
      .post(`/api/products/${product._id}/variants`)
      .set("Cookie", sellerB.cookie)
      .send({ "price[amount]": 500, "price[currency]": "INR", stock: 5 });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("NOT_OWNER");
  });

  it("seller A CAN delete their own product → 200 (control)", async () => {
    const product = await createProduct(sellerA.user.id);
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Cookie", sellerA.cookie);
    expect(res.status).toBe(200);
  });
});
