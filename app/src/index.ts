import config from "./utils/config";
import app from "./app";
import mongoose from "mongoose";
import { initRedis } from "./queues/registry";

const startApp = async () => {
  try {
    console.log("Connecting to MongoDB");
    await mongoose.connect(config.MONGODB_URI);
    // await redisConnection.connect();
    console.log("Connected to MongoDB");

    await initRedis();
    console.log("Connected to Redis");

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("App startup failed:", err.message);
      process.exit(1);
    }
  }
};

startApp();
