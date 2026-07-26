export default {
  testEnvironment: "node",
  // Native ESM: no transform (run with node --experimental-vm-modules).
  transform: {},
  setupFiles: ["<rootDir>/tests/setup/env.js"],
  globalSetup: "<rootDir>/tests/setup/globalSetup.cjs",
  globalTeardown: "<rootDir>/tests/setup/globalTeardown.cjs",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testTimeout: 30000,
  clearMocks: true,
  // The in-memory replica set can leave a lingering handle on teardown (Windows);
  // teardown still runs in afterAll — this just stops Jest hanging afterwards.
  forceExit: true,
  // V8 provider works with native ESM (the default babel provider needs a transform).
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.js",
    // Excluded: thin third-party/bootstrap adapters exercised via mocks rather than
    // unit-tested directly, so coverage reflects our own application logic.
    "!src/config/db.js",
    "!src/config/razorpay.js",
    "!src/config/logger.js",
    "!src/services/storage.service.js",
    "!src/utils/mailer.js",
  ],
  coverageThreshold: {
    global: { statements: 60 },
  },
  coverageDirectory: "coverage",
};
