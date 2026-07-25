import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { connectDB, disconnectDB } from "./setup/db.js";
import app from "../src/app.js";

beforeAll(connectDB);
afterAll(disconnectDB);

describe("smoke: app boots and health endpoints respond", () => {
  it("GET /api/health returns 200 with status, uptime and version", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("version");
  });

  it("GET /api/health/ready reports the database connected", async () => {
    const res = await request(app).get("/api/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.db).toBe("connected");
  });

  it("an unknown route returns a 404 JSON error", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, code: "NOT_FOUND" });
  });

  it("sends the x-request-id response header", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-request-id"]).toBeDefined();
  });
});
