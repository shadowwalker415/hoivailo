import { Queue, Worker, Processor } from "bullmq";
import { Redis } from "ioredis";
import { REDIS_CONFIG } from "../utils/config";
import logger from "../utils/logger";

export interface QueueBundle {
  queue: Queue;
  worker?: Worker;
}

let redisConnectionAPI: Redis | null = null;

let redisConnectionWorker: Redis | null = null;

const registry = new Map<string, QueueBundle>();

export const initRedisAPI = async () => {
  redisConnectionAPI = new Redis(REDIS_CONFIG);
  await redisConnectionAPI.connect();
};

export const initRedisWorker = async () => {
  redisConnectionWorker = new Redis(REDIS_CONFIG);
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
      if (!job) {
        return;
      }

      const attemptsMade = job.attemptsMade;
      const maxAttempts = job.opts.attempts ?? 1;
      if (attemptsMade >= maxAttempts) {
        logger.error("Job retries exhausted", {
          jobId: job.id,
          attemptsMade,
          maxAttempts,
          error: err.message,
          stack: err
        });
      } else {
        logger.warn("Job failed, retrying", {
          jobId: job.id,
          attemptsMade,
          maxAttempts,
          error: err.message,
          stack: err
        });
      }
    });

    bundle.worker.on("completed", (job) => {
      logger.info("Job completed", { id: job.id });
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
