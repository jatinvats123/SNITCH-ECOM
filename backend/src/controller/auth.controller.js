import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/config.js";
import { sendResetPasswordEmail } from "../utils/mailer.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

const isProduction = config.NODE_ENV === "production";

// Cookie options.
// - httpOnly: JS can't read the token (mitigates XSS token theft).
// - In production the frontend (Vercel) and backend (Render) are different hosts, so the
//   auth cookie is sent cross-site: it must be `secure` + `sameSite: "none"`.
// - In local dev over http we keep `sameSite: "lax"` and non-secure, otherwise the browser
//   would refuse to store the cookie on localhost.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 100 * 24 * 60 * 60 * 1000, // 100 days, matches the JWT expiry
};

// Public-facing view of a user — never leak password or reset tokens.
const toPublicUser = (user) => ({
  id: user._id,
  email: user.email,
  contact: user.contact,
  fullName: user.fullName,
  role: user.role,
});

function issueToken(user, res) {
  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "100d" });
  res.cookie("token", token, cookieOptions);
}

function sendTokenResponse(user, res, message, statusCode = 200) {
  issueToken(user, res);
  return sendSuccess(res, statusCode, message, { user: toPublicUser(user) });
}

export const regitser = asyncHandler(async (req, res) => {
  const { email, contact, password, fullname, isSeller } = req.body;

  const existingUser = await userModel.findOne({ $or: [{ email }, { contact }] });
  if (existingUser) {
    throw AppError.badRequest("User already exists", "USER_EXISTS");
  }

  const user = await userModel.create({
    email,
    contact,
    password,
    fullName: fullname,
    role: isSeller ? "seller" : "buyer",
  });
  return sendTokenResponse(user, res, "User registered successfully");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 400, "INVALID_CREDENTIALS");
  }
  return sendTokenResponse(user, res, "User logged in successfully");
});

export const googleCallBack = asyncHandler(async (req, res) => {
  const { id, displayName, emails } = req.user;
  const email = emails[0].value;
  let user = await userModel.findOne({ email });
  if (!user) {
    user = await userModel.create({ email, googleId: id, fullName: displayName });
  }
  issueToken(user, res);
  res.redirect(`${config.CLIENT_URL}/?google=success`);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${config.CLIENT_URL}/reset-password/${rawToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);
  }

  // Always return the same response, whether or not the email exists, so we don't
  // leak which emails are registered.
  return sendSuccess(res, 200, "If an account with that email exists, a reset link has been sent");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await userModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw AppError.badRequest("Reset link is invalid or has expired", "INVALID_RESET_TOKEN");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return sendSuccess(res, 200, "Password reset successfully");
});

export const logout = asyncHandler(async (_req, res) => {
  // clearCookie must use the same attributes the cookie was set with, or the browser keeps it.
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  return sendSuccess(res, 200, "Logged out successfully");
});

export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "User fetched successfully", { user: toPublicUser(req.user) });
});
