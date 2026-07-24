import { Router } from "express";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

// Read the version from package.json without a JSON import assertion, so it works
// across all supported Node versions.
const __dirname = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf8"));

const router = Router();

// GET /api/health — process liveness. Intentionally cheap; never touches the DB,
// so it stays green even if the database is momentarily unavailable.
router.get("/", (_req, res) => {
  sendSuccess(res, 200, "OK", {
    status: "ok",
    uptime: process.uptime(),
    version,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health/ready — readiness. Confirms MongoDB is actually reachable with a
// ping, returning 503 (not ready) if it is not, so a load balancer can hold traffic.
router.get(
  "/ready",
  asyncHandler(async (_req, res) => {
    let dbConnected = mongoose.connection.readyState === 1;
    if (dbConnected) {
      try {
        await mongoose.connection.db.admin().ping();
      } catch {
        dbConnected = false;
      }
    }

    return res.status(dbConnected ? 200 : 503).json({
      success: dbConnected,
      message: dbConnected ? "Ready" : "Not ready",
      status: dbConnected ? "ready" : "unavailable",
      db: dbConnected ? "connected" : "disconnected",
      uptime: process.uptime(),
      version,
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
