import helmet from "helmet";

// Third-party origins the app integrates with.
const IMAGEKIT = "https://ik.imagekit.io";
const RAZORPAY_API = "https://api.razorpay.com";
const RAZORPAY_CHECKOUT = "https://checkout.razorpay.com";

// Security response headers. This API returns JSON, so the CSP is primarily
// defence-in-depth and covers any HTML the backend serves (e.g. the future
// Swagger UI); the SPA's effective CSP is enforced at the frontend host. The
// directives whitelist the ImageKit CDN (product images) and Razorpay (checkout
// script, frame and API) so those integrations keep working wherever the CSP applies.
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", RAZORPAY_CHECKOUT],
      imgSrc: ["'self'", "data:", IMAGEKIT],
      frameSrc: ["'self'", RAZORPAY_API, RAZORPAY_CHECKOUT],
      connectSrc: ["'self'", RAZORPAY_API, IMAGEKIT],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
  // The API is consumed cross-origin by the frontend; allow its resources to be
  // read cross-origin. CORS still governs credentialed XHR access separately.
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export default securityHeaders;
