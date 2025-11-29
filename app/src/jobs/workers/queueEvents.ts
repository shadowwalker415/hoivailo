import { QueueEvents } from "bullmq";
import { redisConnection } from "../../worker";
import {
  userConfirmationEmailQueue,
  userRecordUpdateQueue,
  adminConfirmationEmailQueue
} from "../queues/queques";
import { addJobsToQueue } from "../../utils/redisHelpers";

export const userConfirmationEmailQueueEvent = new QueueEvents(
  "User-Confirmation-Email",
  {
    connection: redisConnection
  }
);

export const userRecordUpdateQueueEvent = new QueueEvents(
  "Confirm-User-Email",
  {
    connection: redisConnection
  }
);

userConfirmationEmailQueueEvent.on("completed", async ({ jobId }) => {
  const completedJob = await userConfirmationEmailQueue.getJob(jobId);
  if (!completedJob) {
    // We will log here
    return;
  }
  console.log("User email confirmation job completed");
  console.log("Adding user record update job to the queue");
  await addJobsToQueue(
    userRecordUpdateQueue,
    "confirm-user-email",
    completedJob.data
  );
});
userRecordUpdateQueueEvent.on("completed", async ({ jobId }) => {
  const completedJob = await userRecordUpdateQueue.getJob(jobId);
  if (!completedJob) {
    return;
  }
  console.log("User record update event completed");
  console.log("Adding admin confirmation email job to the queue");
  await addJobsToQueue(
    adminConfirmationEmailQueue,
    "admin-email-confirmation",
    completedJob.data
  );
});

async function initQueueEvents() {
  await userConfirmationEmailQueueEvent.waitUntilReady();
}

userConfirmationEmailQueueEvent.on("failed", ({ jobId, failedReason }) => {
  console.log("Job failed:", jobId, failedReason);
});

userConfirmationEmailQueueEvent.on("error", console.error);

userConfirmationEmailQueueEvent.on("waiting", ({ jobId }) => {
  console.log("Waiting event:", jobId);
});

(async () => {
  await initQueueEvents();
})();
