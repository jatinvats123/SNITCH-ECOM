// Loads Razorpay's official Checkout script once and resolves with the global
// `window.Razorpay` constructor. Awaiting this before opening Checkout guarantees
// the script is ready (avoids the race where the popup call runs before load).
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayPromise = null;

export const loadRazorpay = () => {
  // Already available (script loaded earlier in the session).
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  // A load is already in flight — reuse it.
  if (razorpayPromise) return razorpayPromise;

  razorpayPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        razorpayPromise = null;
        reject(new Error("Razorpay script loaded but window.Razorpay is undefined"));
      }
    };
    const fail = () => {
      razorpayPromise = null;
      reject(
        new Error(
          "Failed to load Razorpay Checkout script (check your internet connection or ad-blocker)",
        ),
      );
    };

    const existing = document.querySelector(`script[src="${RAZORPAY_SRC}"]`);
    if (existing) {
      if (window.Razorpay) return resolve(window.Razorpay);
      existing.addEventListener("load", finish);
      existing.addEventListener("error", fail);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = fail;
    document.body.appendChild(script);
  });

  return razorpayPromise;
};
