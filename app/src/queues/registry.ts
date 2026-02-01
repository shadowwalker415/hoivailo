import { Queue, Worker, Processor } from "bullmq";
import { Redis } from "ioredis";
import { REDIS_DEV_CONFIG } from "../utils/config";

export interface QueueBundle {
  queue: Queue;
  worker?: Worker;
}

let redisConnectionAPI: Redis | null = null;

let redisConnectionWorker: Redis | null = null;

const registry = new Map<string, QueueBundle>();

export const initRedisAPI = async () => {
  redisConnectionAPI = new Redis(REDIS_DEV_CONFIG);
  await redisConnectionAPI.connect();
};

export const initRedisWorker = async () => {
  redisConnectionWorker = new Redis(REDIS_DEV_CONFIG);
  await redisConnectionWorker.connect();
};

export const registerQueue = (
  name: string,
  options: { worker?: Processor }
) => {
  // Checking if API redis connection has already been initialized
  if (!redisConnectionAPI) {
    throw new Error("API Redis connection has not been initialized");
  }

  // Checking if queue with key already exist in the hash map
  if (registry.has(name)) {
    return registry.get(name);
  }

  const bundle: QueueBundle = {
    queue: new Queue(name, { connection: redisConnectionAPI })
  };

  if (options.worker) {
    // Checking if Redis connection for worker has already been initialized.
    if (!redisConnectionWorker) {
      throw new Error("Worker Redis connection has not been initialized");
    }
    bundle.worker = new Worker(name, options.worker, {
      connection: redisConnectionWorker
    });

    bundle.worker.on("ready", () => {
      `Worker for ${name} is ready.`;
    });

    bundle.worker.on("failed", (job, err) => {
      console.log(`Job with id ${job?.id} failed, ${err}`);
    });
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
