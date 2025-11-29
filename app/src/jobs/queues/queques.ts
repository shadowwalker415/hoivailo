import { Queue } from "bullmq";
import { redisConnection } from "../../worker";

export const userConfirmationEmailQueue = new Queue("User-Confirmation-Email", {
  connection: redisConnection
});

export const adminConfirmationEmailQueue = new Queue(
  "Admin-Confirmation-Email",
  {
    connection: redisConnection
  }
);
export const userRecordUpdateQueue = new Queue("Confirm-User-Email", {
  connection: redisConnection
});

export const userCancellationEmailQueue = new Queue("User-Cancellation-Email", {
  connection: redisConnection
});
export const adminCancellationEmailQueue = new Queue(
  "Admin-Cancellation-Email",
  {
    connection: redisConnection
  }
);
export const messageRequestQueue = new Queue("Message-Request", {
  connection: redisConnection
});
