// Jest `setupFiles` runs before any test module is imported, so config.js sees
// these values. dotenv.config() never overrides already-set vars, so a real .env
// present on disk cannot leak into the test run.
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

// Unused by tests (they connect to an in-memory replica set), but config.js requires it.
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/aveniq_test";

process.env.JWT_SECRET = "test_jwt_secret";
process.env.JWT_EXPIRES_DAYS = "7";

process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
process.env.GOOGLE_CLIENT_SECRET = "test_google_client_secret";
process.env.GOOGLE_CALLBACK_URL = "http://localhost/api/auth/google/callback";

process.env.IMAGEKIT_PRIVATE_KEY = "test_imagekit_private_key";

process.env.SMTP_HOST = "smtp.example.test";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "test_smtp_user";
process.env.SMTP_PASS = "test_smtp_pass";
process.env.EMAIL_FROM = "no-reply@aveniq.test";

process.env.CLIENT_URL = "http://localhost:5173";

// Deterministic key the signature tests use to compute a valid Razorpay HMAC.
process.env.RAZORPAY_KEY_ID = "rzp_test_key_id";
process.env.RAZORPAY_KEY_SECRET = "test_razorpay_secret";
