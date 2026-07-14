import Razorpay from "razorpay";
import { config } from "./config.js";

// Single Razorpay client used across the app.
// Test vs Live is decided purely by the key pair in the environment —
// switching to production later only requires swapping RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.
export const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
});
