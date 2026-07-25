import { jest, describe, it, expect, beforeAll, afterEach, afterAll } from "@jest/globals";
import request from "supertest";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { connectDB, clearDB, disconnectDB } from "./setup/db.js";
import { registerUser } from "./factories/index.js";
import userModel from "../src/models/user.model.js";

// Mock the mailer so forgot-password never touches SMTP.
const sendResetPasswordEmail = jest.fn().mockResolvedValue(undefined);
jest.unstable_mockModule("../src/utils/mailer.js", () => ({ sendResetPasswordEmail }));

const { default: app } = await import("../src/app.js");

beforeAll(connectDB);
afterEach(async () => {
  sendResetPasswordEmail.mockClear();
  await clearDB();
});
afterAll(disconnectDB);

const valid = {
  email: "new@test.com",
  contact: "9999999999",
  password: "password123",
  fullname: "New User",
  isSeller: false,
};

describe("auth: registration", () => {
  it("registers a valid user, returns the public user (no password) and sets an httpOnly cookie", async () => {
    const res = await request(app).post("/api/auth/register").send(valid);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toMatchObject({ email: "new@test.com", role: "buyer" });
    expect(res.body.user).not.toHaveProperty("password");
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toMatch(/Secure/i);
  });

  it("registers a seller when isSeller is true", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, isSeller: true });
    expect(res.body.user.role).toBe("seller");
  });

  it.each([
    ["invalid email", { email: "not-an-email" }],
    ["contact not 10 digits", { contact: "123" }],
    ["password under 8 chars", { password: "short" }],
    ["missing fullname", { fullname: "" }],
    ["non-boolean isSeller", { isSeller: "yes" }],
  ])("rejects registration with %s (400 VALIDATION_ERROR)", async (_label, patch) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, ...patch });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a duplicate email with 400 USER_EXISTS", async () => {
    await request(app).post("/api/auth/register").send(valid);
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...valid, contact: "8888888888" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("USER_EXISTS");
  });
});

describe("auth: login", () => {
  it("logs in with correct credentials", async () => {
    await registerUser(app, { email: "login@test.com", password: "password123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@test.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("login@test.com");
    expect(res.headers["set-cookie"][0]).toMatch(/token=/);
  });

  it("rejects a wrong password with 400 INVALID_CREDENTIALS", async () => {
    await registerUser(app, { email: "login2@test.com", password: "password123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login2@test.com", password: "wrongpass" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects a nonexistent email with 400 INVALID_CREDENTIALS", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "password123" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });
});

describe("auth: protected route and token handling", () => {
  it("GET /api/auth/me without a token → 401 NO_TOKEN", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("NO_TOKEN");
  });

  it("GET /api/auth/me with a valid cookie returns the current user", async () => {
    const { cookie } = await registerUser(app, { email: "me@test.com" });
    const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.com");
  });

  it("GET /api/auth/me with a malformed token → 401 INVALID_TOKEN (not 500)", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", ["token=not.a.valid.jwt"]);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("GET /api/auth/me with an expired token → 401 INVALID_TOKEN", async () => {
    const expired = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET,
      { expiresIn: "-1s" },
    );
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", [`token=${expired}`]);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_TOKEN");
  });

  it("logout clears the token cookie", async () => {
    const { cookie } = await registerUser(app, { email: "out@test.com" });
    const res = await request(app).post("/api/auth/logout").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"][0]).toMatch(/token=;/);
  });
});

describe("auth: password reset", () => {
  it("forgot-password returns the same 200 whether or not the email exists (no enumeration)", async () => {
    await registerUser(app, { email: "reset@test.com" });
    const existing = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "reset@test.com" });
    const missing = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@test.com" });
    expect(existing.status).toBe(200);
    expect(missing.status).toBe(200);
    expect(existing.body.message).toBe(missing.body.message);
    // Only the existing account triggers an email.
    expect(sendResetPasswordEmail).toHaveBeenCalledTimes(1);
  });

  it("resets the password with a valid, unexpired token and the new password logs in", async () => {
    const { user } = await registerUser(app, { email: "reset2@test.com" });
    const rawToken = "rawtoken123";
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    await userModel.updateOne(
      { _id: user.id },
      { resetPasswordToken: hashed, resetPasswordExpires: Date.now() + 60000 },
    );

    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: "newpassword123" });
    expect(res.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "reset2@test.com", password: "newpassword123" });
    expect(login.status).toBe(200);
  });

  it("rejects an expired reset token with 400 INVALID_RESET_TOKEN", async () => {
    const { user } = await registerUser(app, { email: "reset3@test.com" });
    const rawToken = "expiredtoken";
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    await userModel.updateOne(
      { _id: user.id },
      { resetPasswordToken: hashed, resetPasswordExpires: Date.now() - 1000 },
    );

    const res = await request(app)
      .post(`/api/auth/reset-password/${rawToken}`)
      .send({ password: "newpassword123" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_RESET_TOKEN");
  });

  it("rejects an unknown reset token with 400", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/unknowntoken")
      .send({ password: "newpassword123" });
    expect(res.status).toBe(400);
  });
});
