import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

// A single-node replica set (not a standalone) because the order-creation flow uses
// a MongoDB transaction, which requires a replica set. Everything is in-memory, so
// tests need no external database.
let replset;

export async function connectDB() {
  replset = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    // Windows first-launch (Defender scanning the freshly-extracted mongod.exe) can
    // exceed the default 10s; give the instance more headroom.
    instanceOpts: [{ launchTimeout: 60000 }],
  });
  await mongoose.connect(replset.getUri());
}

export async function clearDB() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (replset) await replset.stop();
}
