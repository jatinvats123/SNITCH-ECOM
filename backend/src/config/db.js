import mongoose from "mongoose";
import { config } from "./config.js";
import logger from "./logger.js";

const connectDB = async () => {
  await mongoose.connect(config.MONGO_URI);
  logger.info("MongoDB connected");
};

export default connectDB;
