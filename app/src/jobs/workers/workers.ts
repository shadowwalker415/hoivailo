import { Worker } from "bullmq";
import { redisConnection } from "../../worker";
import {
  sendContactNotificationEmail,
  sendAdminConfirmationEmail,
  sendUserConfirmationEmail,
  sendCancellationEmailAdmin,
  sendCancellationEmailUser
} from "../../tasks/emails";
import { confirmUserEmail } from "../../tasks/appointments";

export const userConfirmationEmailWorker = new Worker(
  "User-Confirmation-Email",
  async (job) => {
    await sendUserConfirmationEmail(job.data);
  },
  {
    connection: redisConnection
  }
);

export const adminConfirmationEmailWorker = new Worker(
  "Admin-Confirmation-Email",
  async (job) => {
    sendAdminConfirmationEmail(job.data);
  },
  {
    connection: redisConnection
  }
);

export const userRecordUpdateWorker = new Worker(
  "Confirm-User-Email",
  async (job) => {
    await confirmUserEmail(job.data);
  },
  {
    connection: redisConnection
  }
);

export const userCancellationEmailWorker = new Worker(
  "User-Cancellation-Email",
  async (job) => {
    await sendCancellationEmailUser(job.data);
  },
  {
    connection: redisConnection
  }
);

export const adminCancellationEmailWorker = new Worker(
  "Admin-Cancellation-Email",
  async (job) => {
    await sendCancellationEmailAdmin(job.data);
  },
  {
    connection: redisConnection
  }
);

// Worker for message request background jobs
const messageRequestWorker = new Worker(
  "Message-Request",
  async (job) => {
    await sendContactNotificationEmail(job.data);
  },
  {
    connection: redisConnection
  }
);

messageRequestWorker.on("failed", (job, err) => {
  // We will log the error here
  console.error("Job failed:", job?.id, err);
});
