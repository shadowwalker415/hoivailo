import { Redis } from "ioredis";
import { REDIS_DEV_CONFIG } from "./utils/config";

export const redisConnection = new Redis(REDIS_DEV_CONFIG);

// These are just place holders for now
redisConnection.on("connection", () => {
  console.log("Connected to redis server");
});
