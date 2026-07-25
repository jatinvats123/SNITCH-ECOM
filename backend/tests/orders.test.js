import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import { connectDB, clearDB, disconnectDB } from "./setup/db.js";
import { registerUser, registerSeller, createProduct, createOrder } from "./factories/index.js";
import app from "../src/app.js";

let buyer1, buyer2;
beforeAll(connectDB);
beforeEach(async () => {
  const s = `${Date.now()}${Math.random().toString(36).slice(2)}`;
  buyer1 = await registerUser(app, { email: `b1_${s}@test.com` });
  buyer2 = await registerUser(app, { email: `b2_${s}@test.com` });
});
afterEach(clearDB);
afterAll(disconnectDB);

describe("orders: buyer history and isolation", () => {
  it("a buyer sees only their own orders", async () => {
    await createOrder(buyer1.user.id, { title: "B1 item" });
    await createOrder(buyer2.user.id, { title: "B2 item" });

    const res1 = await request(app).get("/api/orders").set("Cookie", buyer1.cookie);
    expect(res1.status).toBe(200);
    expect(res1.body.orders).toHaveLength(1);
    expect(res1.body.orders[0].items[0].title).toBe("B1 item");

    const res2 = await request(app).get("/api/orders").set("Cookie", buyer2.cookie);
    expect(res2.body.orders).toHaveLength(1);
    expect(res2.body.orders[0].items[0].title).toBe("B2 item");
  });

  it("returns an empty history when the buyer has no orders", async () => {
    const res = await request(app).get("/api/orders").set("Cookie", buyer1.cookie);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });

  it("fetches a single owned order by id", async () => {
    const order = await createOrder(buyer1.user.id);
    const res = await request(app).get(`/api/orders/${order._id}`).set("Cookie", buyer1.cookie);
    expect(res.status).toBe(200);
    expect(res.body.order._id).toBe(order._id.toString());
  });

  it("returns 404 fetching another buyer's order (IDOR guard)", async () => {
    const order = await createOrder(buyer1.user.id);
    const res = await request(app).get(`/api/orders/${order._id}`).set("Cookie", buyer2.cookie);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("ORDER_NOT_FOUND");
  });

  it("rejects an invalid order id with 400", async () => {
    const res = await request(app).get("/api/orders/not-a-valid-id").set("Cookie", buyer1.cookie);
    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });
});

describe("orders: seller view", () => {
  it("a seller sees orders containing their products, with line items filtered to their own", async () => {
    const seller = await registerSeller(app, { email: `sell_${Date.now()}@test.com` });
    const otherSeller = await registerSeller(app, { email: `sell2_${Date.now()}@test.com` });
    const myProduct = await createProduct(seller.user.id, { title: "Mine" });
    const theirProduct = await createProduct(otherSeller.user.id, { title: "Theirs" });

    await createOrder(buyer1.user.id, {
      items: [
        {
          product: myProduct._id,
          title: "Mine",
          quantity: 1,
          price: { amount: 1000, currency: "INR" },
        },
        {
          product: theirProduct._id,
          title: "Theirs",
          quantity: 1,
          price: { amount: 2000, currency: "INR" },
        },
      ],
    });

    const res = await request(app).get("/api/orders/seller").set("Cookie", seller.cookie);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].items).toHaveLength(1);
    expect(res.body.orders[0].items[0].title).toBe("Mine");
  });

  it("returns an empty list for a seller whose products are in no orders", async () => {
    const seller = await registerSeller(app, { email: `sell3_${Date.now()}@test.com` });
    await createOrder(buyer1.user.id); // references an unrelated product id
    const res = await request(app).get("/api/orders/seller").set("Cookie", seller.cookie);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });
});
