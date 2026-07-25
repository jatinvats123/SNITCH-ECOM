import express from "express";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { randomUUID } from "crypto";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import passport from "passport";
import cartRouter from "./routes/cart.routes.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";
import logger from "./config/logger.js";
import productRouter from "./routes/product.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import orderRouter from "./routes/order.routes.js";
import healthRouter from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { securityHeaders, sanitizeInput } from "./middleware/security.middleware.js";
import { generalLimiter } from "./middleware/rateLimit.middleware.js";
import hpp from "hpp";
import { AppError } from "./utils/AppError.js";
const app = express();

// Behind Render/Vercel the app runs behind a TLS-terminating proxy — trust it so
// secure cookies and req.protocol/host are resolved from the forwarded headers.
app.set("trust proxy", 1);

// Security response headers (helmet) — registered first so every response carries them.
app.use(securityHeaders);

// Structured request logging with a per-request id, propagated via `x-request-id`.
// Reuse an inbound id (e.g. set by a proxy) when present, otherwise generate one,
// and echo it back on the response so clients and proxies can correlate logs.
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers["x-request-id"] || randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

// General API rate limit (health probes exempt). Strict per-route limits live on
// the sensitive auth endpoints (see auth.routes.js).
app.use(generalLimiter);

// CORS: explicit allow-list from env (comma-separated CORS_ORIGINS, defaults to
// CLIENT_URL); credentialed and never a wildcard. Requests with no Origin header
// (same-origin, curl, server-to-server) are allowed; disallowed browser origins are
// rejected with 403. In non-production, localhost origins are additionally allowed.
const allowedOrigins = (config.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      if (
        config.NODE_ENV !== "production" &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new AppError("Origin not allowed by CORS", 403, "CORS_FORBIDDEN"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// NoSQL-injection sanitization, then HTTP parameter-pollution guard. Order matters:
// sanitizeInput replaces req.query with a plain object so hpp can operate on it safely
// under Express 5 (where req.query is otherwise a read-only getter).
app.use(sanitizeInput);
app.use(hpp());

app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    },
  ),
);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/orders", orderRouter);

// 404 for anything unmatched, then the central error handler.
// These two MUST remain the last middleware registered.
app.use(notFound);
app.use(errorHandler);

export default app;
