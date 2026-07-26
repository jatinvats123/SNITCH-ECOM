// Start ONE in-memory replica set for the whole test run (a replica set is needed
// because the order-creation flow uses a transaction). Starting it once — rather
// than per test file — is faster and removes the per-file startup flakiness.
// CommonJS so Jest's globalSetup loader handles it reliably under native ESM.
const { MongoMemoryReplSet } = require("mongodb-memory-server");

module.exports = async () => {
  const replset = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ launchTimeout: 60000 }],
  });
  // Shared with the test files via env, and with globalTeardown via globalThis.
  process.env.__MONGO_URI__ = replset.getUri();
  globalThis.__MONGO_REPLSET__ = replset;
};
