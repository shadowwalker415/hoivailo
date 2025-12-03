import { Queue } from "bullmq";
import { redisConnection } from "../../worker";

export const userConfirmationEmailQueue = new Queue("user-confirmation-email", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnFail: false
  }
});

export const adminConfirmationEmailQueue = new Queue(
  "admin-confirmation-email",
  {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false
    }
  }
);
export const userRecordUpdateQueue = new Queue("update-user-record", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
});

export const userCancellationEmailQueue = new Queue("user-cancellation-email", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
});
export const adminCancellationEmailQueue = new Queue(
  "admin-cancellation-email",
  {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false
    }
  }
);
export const messageRequestQueue = new Queue("message-request", {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
});
