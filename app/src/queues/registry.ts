import { Queue, Worker, Processor } from "bullmq";
import { Redis } from "ioredis";
import { REDIS_DEV_CONFIG } from "../utils/config";

export interface QueueBundle {
  queue: Queue;
  worker?: Worker;
}

let redis: Redis;

const registry = new Map<string, QueueBundle>();

export const initRedis = async () => {
  redis = new Redis(REDIS_DEV_CONFIG);
  await redis.connect();
};

// The any is just a placeholder
export const registerQueue = (
  name: string,
  options: { worker?: Processor }
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

  registry.set(name, bundle);
  return bundle;
};

export const getQueue = (name: string) => {
  const bundle = registry.get(name);
  // Checking if a queue with the name is registered.
  if (!bundle) {
    throw new Error(`Queue ${name} not registered.`);
  }
  return bundle.queue;
};
