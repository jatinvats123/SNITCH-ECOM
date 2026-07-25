import { rateLimit } from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// Shared 429 handler: sets Retry-After and returns the app's standard error shape.
const limitHandler = (message, code) => (req, res, _next, options) => {
  res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
  res.status(429).json({ success: false, message, code });
};

// General limiter for the whole API. Health probes are exempt so a load balancer
// polling readiness is never throttled. Limits are generous in dev.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isProduction ? 1000 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/api/health"),
  handler: limitHandler("Too many requests, please try again later.", "RATE_LIMITED"),
});

// Strict limiter for the sensitive auth endpoints (login / register / forgot /
// reset) to blunt brute-force and credential-stuffing. Not applied to /me, /logout
// or the OAuth routes.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isProduction ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler(
    "Too many attempts. Please wait a while before trying again.",
    "RATE_LIMITED",
  ),
});
