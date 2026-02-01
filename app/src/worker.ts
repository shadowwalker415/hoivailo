import { initQueuesForWorker } from "./queues";
import { initRedisAPI, initRedisWorker } from "./queues/registry";
import config from "./utils/config";
import mongoose from "mongoose";

const startWorkerProcess = async () => {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");
  console.log("Initializting Producer redis connection");
  await initRedisAPI();

  // Connecting worker process to redis instance.
  console.log("Initializing Consumer redis connections");
  await initRedisWorker();
  console.log("Connected to redis");

  // Registering queues with their worker processors.
  initQueuesForWorker();
};

startWorkerProcess();
