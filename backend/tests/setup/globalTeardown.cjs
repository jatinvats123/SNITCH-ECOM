module.exports = async () => {
  await globalThis.__MONGO_REPLSET__?.stop();
};
