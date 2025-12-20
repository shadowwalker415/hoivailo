import { Queue, Worker, QueueEvents, Processor } from "bullmq";
import { Redis } from "ioredis";
import { REDIS_DEV_CONFIG } from "../utils/config";

export interface QueueBundle {
  queue: Queue;
  worker?: Worker;
  events?: QueueEvents;
}

let redis: Redis;

const registry = new Map<string, QueueBundle>();

export const initRedis = async () => {
  redis = new Redis(REDIS_DEV_CONFIG);
  await redis.connect();
  console.log("Redis connected");
};

// The any is just a placeholder
export const registerQueue = (
  name: string,
  options: { worker?: Processor; events?: boolean }
) => {
  // Checking if redis has already been initialized
  if (!redis) {
    throw new Error("Redis has not been initialized");
  }
  // Checking if queue with key already exist in the hash map
  if (registry.has(name)) {
    return registry.get(name)!;
  }

  const bundle: QueueBundle = {
    queue: new Queue(name, { connection: redis })
  };

  if (options.worker) {
    bundle.worker = new Worker(name, options.worker, { connection: redis });
  }

  if (options.events) {
    bundle.events = new QueueEvents(name, { connection: redis });
  }

  registry.set(name, bundle);
  return bundle;
};

export const getQueue = (name: string) => {
  const bundle = registry.get(name);
  // Checking if a queue with the name is registered
  if (!bundle) {
    throw new Error(`Queue ${name} not registered.`);
  }
  return bundle.queue;
};

export const getEvents = (name: string) => {
  return registry.get(name)?.events;
};
