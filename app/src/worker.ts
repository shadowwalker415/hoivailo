import { initQueuesForWorker } from "./queues";
import { initRedisAPI, initRedisWorker } from "./queues/registry";
import config from "./utils/config";
import mongoose from "mongoose";
import logger from "./utils/logger";

const startWorkerProcess = async () => {
  try {
    logger.info("Starting worker process");
    logger.info("Connecting to mongoDB");
    // Connecting to the database
    await mongoose.connect(config.MONGODB_URI);
    logger.info("Successfully connected to MongoDB");
    logger.info("Initializing connection to producer Redis");
    await initRedisAPI();
    logger.info("Successfully connected to producer Redis");

    // Connecting worker process to redis instance.
    logger.info("Initializing connection to consumer Redis");
    await initRedisWorker();
    logger.info("Successfully connected to consumer Redis");

    // Registering queues with their worker processors.
    initQueuesForWorker();
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("Worker process startup failed", {
        message: err.message,
        stack: err
      });
      logger.info("Exiting worker process");
      process.exit(1);
    }
  }
};

startWorkerProcess();
