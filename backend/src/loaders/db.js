import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${env.MONGODB_URI}/${env.DB_NAME}`
    );
    logger.info(
      `MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    logger.error("MONGODB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
