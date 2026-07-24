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
import healthRouter from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
const app = express();

// Behind Render/Vercel the app runs behind a TLS-terminating proxy — trust it so
// secure cookies and req.protocol/host are resolved from the forwarded headers.
app.set("trust proxy", 1);

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

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// 404 for anything unmatched, then the central error handler.
// These two MUST remain the last middleware registered.
app.use(notFound);
app.use(errorHandler);

export default app;
