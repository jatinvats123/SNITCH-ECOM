import { jest, describe, it, expect, beforeAll, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import { connectDB, clearDB, disconnectDB } from "./setup/db.js";
import { registerSeller, createProduct, makeVariant } from "./factories/index.js";

// Mock the storage service so product/variant creation never touches ImageKit.
jest.unstable_mockModule("../src/services/storage.service.js", () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: "https://ik.imagekit.io/test/uploaded.png" }),
}));

const { default: app } = await import("../src/app.js");

// 16 bytes beginning with the PNG magic signature — passes the magic-byte sniffer.
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0]);

let seller;
beforeAll(connectDB);
beforeEach(async () => {
  seller = await registerSeller(app, { email: `seller_${Date.now()}@test.com` });
});
afterEach(clearDB);
afterAll(disconnectDB);

describe("products: creation", () => {
  it("creates a product with all fields and an image → 201", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", seller.cookie)
      .field("title", "Linen Shirt")
      .field("description", "A breathable linen shirt")
      .field("priceAmount", "1299")
      .field("priceCurrency", "INR")
      .attach("images", PNG, { filename: "shirt.png", contentType: "image/png" });
    expect(res.status).toBe(201);
    expect(res.body.product).toMatchObject({ title: "Linen Shirt" });
    expect(res.body.product.images).toHaveLength(1);
  });

  it("rejects creation without a title → 400", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", seller.cookie)
      .field("description", "no title")
      .field("priceAmount", "1299")
      .field("priceCurrency", "INR");
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects creation without a price → 400", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", seller.cookie)
      .field("title", "No price")
      .field("description", "missing price");
    expect(res.status).toBe(400);
  });

  it("rejects a non-image upload (magic-byte sniff) → 400 INVALID_FILE_TYPE", async () => {
    const fakeImage = Buffer.from("<svg><script>alert(1)</script></svg>");
    const res = await request(app)
      .post("/api/products")
      .set("Cookie", seller.cookie)
      .field("title", "Sneaky")
      .field("description", "not really an image")
      .field("priceAmount", "999")
      .field("priceCurrency", "INR")
      .attach("images", fakeImage, { filename: "x.png", contentType: "image/png" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_FILE_TYPE");
  });
});

describe("products: variants", () => {
  it("adds a variant to an owned product → 201", async () => {
    const product = await createProduct(seller.user.id);
    const res = await request(app)
      .post(`/api/products/${product._id}/variants`)
      .set("Cookie", seller.cookie)
      .field("price[amount]", "500")
      .field("price[currency]", "INR")
      .field("stock", "5")
      .field("attributes", JSON.stringify({ Size: "L" }));
    expect(res.status).toBe(201);
    expect(res.body.product.variants).toHaveLength(1);
    expect(res.body.product.variants[0].stock).toBe(5);
  });

  it("removes a variant → 200", async () => {
    const product = await createProduct(seller.user.id, { variants: [makeVariant()] });
    const variantId = product.variants[0]._id.toString();
    const res = await request(app)
      .delete(`/api/products/${product._id}/variants/${variantId}`)
      .set("Cookie", seller.cookie);
    expect(res.status).toBe(200);
    expect(res.body.product.variants).toHaveLength(0);
  });

  it("returns 404 removing a nonexistent variant", async () => {
    const product = await createProduct(seller.user.id);
    const res = await request(app)
      .delete(`/api/products/${product._id}/variants/507f1f77bcf86cd799439011`)
      .set("Cookie", seller.cookie);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("VARIANT_NOT_FOUND");
  });

  it("deletes an owned product → 200", async () => {
    const product = await createProduct(seller.user.id);
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Cookie", seller.cookie);
    expect(res.status).toBe(200);
  });
});

describe("products: catalog, pagination, filter and search (public)", () => {
  it("lists products with pagination boundaries", async () => {
    for (let i = 0; i < 15; i++) {
      await createProduct(seller.user.id, { title: `Item ${i}`, amount: 100 + i });
    }
    const page1 = await request(app).get("/api/products?page=1&limit=10");
    expect(page1.status).toBe(200);
    expect(page1.body.products).toHaveLength(10);
    expect(page1.body.pagination).toMatchObject({ page: 1, limit: 10, total: 15, pages: 2 });

    const page2 = await request(app).get("/api/products?page=2&limit=10");
    expect(page2.body.products).toHaveLength(5);
  });

  it("filters by price range", async () => {
    await createProduct(seller.user.id, { title: "Cheap", amount: 100 });
    await createProduct(seller.user.id, { title: "Mid", amount: 500 });
    await createProduct(seller.user.id, { title: "Pricey", amount: 2000 });
    const res = await request(app).get("/api/products?minPrice=200&maxPrice=1000");
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].title).toBe("Mid");
  });

  it("searches by title with q", async () => {
    await createProduct(seller.user.id, { title: "Zephyr Jacket", description: "wind" });
    await createProduct(seller.user.id, { title: "Cotton Tee", description: "soft" });
    const res = await request(app).get("/api/products?q=Zephyr");
    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(1);
    expect(res.body.products[0].title).toBe("Zephyr Jacket");
  });

  it("returns product detail by id, and 404 for a missing product", async () => {
    const product = await createProduct(seller.user.id, { title: "Detail Me" });
    const ok = await request(app).get(`/api/products/detail/${product._id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.product.title).toBe("Detail Me");

    const missing = await request(app).get("/api/products/detail/507f1f77bcf86cd799439011");
    expect(missing.status).toBe(404);
    expect(missing.body.code).toBe("PRODUCT_NOT_FOUND");
  });
});
