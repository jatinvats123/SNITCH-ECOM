import pino from "pino";

// Structured application logger.
// - Development: pretty, colourised, human-readable output.
// - Production: single-line JSON, ready for a log aggregator.
// Reads NODE_ENV directly (not the validated config) so logging works even
// before/without the full environment being present.
const isProduction = process.env.NODE_ENV === "production";
// Pretty transport only in real development — not in production (JSON logs) and not
// under test (avoids leaving a pino-pretty worker-thread handle open after the suite).
const usePretty = !isProduction && process.env.NODE_ENV !== "test";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  // Never let secrets reach the logs. Covers request headers and any logged
  // object with a password/token field, at any nesting depth.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'res.headers["set-cookie"]',
      "password",
      "*.password",
      "token",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  transport: usePretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});

export default logger;
