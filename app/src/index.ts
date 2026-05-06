import config from "./utils/config";
import app from "./app";
import mongoose from "mongoose";
import { initRedisAPI } from "./queues/registry";
import { initQueusForAPI } from "./queues";
import logger from "./utils/logger";

const startApp = async () => {
  try {
    logger.info("Connecting to MongoDB");

    await mongoose.connect(config.MONGODB_URI);

    logger.info("Successfully Connected to MongoDB");
    logger.info("Connecting to Redis");

    await initRedisAPI();
    logger.info("Successfully connected to Redis");

    initQueusForAPI();

    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("App startup failed:", { error: err.message, stack: err });
      logger.info("Exiting server process");
      process.exit(1);
    }
  }
};

startApp();
