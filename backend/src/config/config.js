import dotenv from "dotenv"
dotenv.config()


if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables")
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables")
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables")
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables")
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables")
}
if (!process.env.SMTP_HOST) {
    throw new Error("SMTP_HOST is not defined in environment variables")
}
if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER is not defined in environment variables")
}
if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS is not defined in environment variables")
}
if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not defined in environment variables")
}
if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is not defined in environment variables")
}
if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is not defined in environment variables")
}
if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables")
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    CLIENT_URL: process.env.CLIENT_URL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    // "production" enables cross-site secure cookies. Defaults to development so local dev is unaffected.
    NODE_ENV: process.env.NODE_ENV || "development",
    // Absolute URL Google redirects back to after login. In production (frontend on Vercel
    // proxying /api to the backend) set this to `${CLIENT_URL}/api/auth/google/callback`.
    // Defaults to the relative path, which preserves the existing local-dev behaviour.
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
}