import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

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

// Recursively drop keys beginning with "$" (MongoDB query operators) — the core
// NoSQL operator-injection vector — while leaving dotted keys intact, because the
// product-variant form legitimately posts fields like "price.amount".
function stripOperatorKeys(value) {
  if (Array.isArray(value)) {
    value.forEach(stripOperatorKeys);
  } else if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$")) delete value[key];
      else stripOperatorKeys(value[key]);
    }
  }
  return value;
}

// Guard against NoSQL operator injection.
// - Query & route params (where "$"/"." never appear legitimately) go through
//   express-mongo-sanitize's sanitize(). Its middleware form reassigns req.query,
//   which is a read-only getter in Express 5, so for the query we shadow the getter
//   with a plain own-property holding the sanitized object — this also lets later
//   middleware (hpp) mutate req.query safely.
// - The request body is stripped of only "$"-prefixed keys so dotted field names
//   used by the variant form survive.
export function sanitizeInput(req, _res, next) {
  if (req.body) stripOperatorKeys(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  const query = req.query;
  if (query && typeof query === "object") {
    Object.defineProperty(req, "query", {
      value: mongoSanitize.sanitize(query),
      writable: true,
      configurable: true,
    });
  }
  next();
}
