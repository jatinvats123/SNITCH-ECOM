import mongoose from "mongoose";

// A single shared in-memory replica set is started once in globalSetup; each test
// file connects a fresh mongoose connection to it (via the URI in the env) and
// disconnects in afterAll. Collections are cleared between tests.
export async function connectDB() {
  await mongoose.connect(process.env.__MONGO_URI__);
}

export async function clearDB() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
