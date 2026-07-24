import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Resolve the authenticated user from the JWT cookie. A missing, invalid,
// expired, or tampered token is an Unauthorized (401) — previously an expired or
// malformed token returned a 500, which masked auth failures as server faults.
async function resolveUserFromToken(req) {
  const token = req.cookies?.token;
  if (!token) {
    throw AppError.unauthorized("Authentication required", "NO_TOKEN");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw AppError.unauthorized("Invalid or expired session", "INVALID_TOKEN");
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    throw AppError.unauthorized("Session user no longer exists", "USER_NOT_FOUND");
  }
  return user;
}

// Requires any authenticated user.
export const authenticateUser = asyncHandler(async (req, _res, next) => {
  req.user = await resolveUserFromToken(req);
  next();
});

// Requires an authenticated user with the seller role.
export const authenticateSeller = asyncHandler(async (req, _res, next) => {
  const user = await resolveUserFromToken(req);
  if (user.role !== "seller") {
    throw AppError.forbidden("Seller account required", "NOT_A_SELLER");
  }
  req.user = user;
  next();
});
