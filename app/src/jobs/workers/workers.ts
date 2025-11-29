import { Job, Worker } from "bullmq";
import { redisConnection } from "../../worker";
import {
  sendContactNotificationEmail,
  sendAdminConfirmationEmail,
  sendUserConfirmationEmail,
  sendCancellationEmailAdmin,
  sendCancellationEmailUser
} from "../../tasks/emails";
import { confirmUserEmail } from "../../tasks/appointments";

import { IAppointment, ICancelledAppointment } from "../../model/appointment";
import { IContact } from "../../types";

export const userConfirmationEmailWorker = new Worker(
  "User-Confirmation-Email",
  async (job: Job<IAppointment>) => {
    const sentEmail = await sendUserConfirmationEmail(job.data);
    if (sentEmail instanceof Error) {
      // We will log here
      console.log(`An error occured: ${sentEmail.message}`);
    }
    console.log("Job completed");
    return true;
  },
  {
    connection: redisConnection
  }
);

export const adminConfirmationEmailWorker = new Worker(
  "Admin-Confirmation-Email",
  async (job: Job<IAppointment>) => {
    const sentEmail = await sendAdminConfirmationEmail(job.data);
    if (sentEmail instanceof Error) {
      // We will log the error here
      console.log(sentEmail.message);
    }
  },
  {
    connection: redisConnection
  }
);

export const userRecordUpdateWorker = new Worker(
  "Confirm-User-Email",
  async (job: Job<IAppointment>) => {
    await confirmUserEmail(job.data);
  },
  {
    connection: redisConnection
  }
);

export const userCancellationEmailWorker = new Worker(
  "User-Cancellation-Email",
  async (job: Job<ICancelledAppointment>) => {
    const sentEmail = await sendCancellationEmailUser(
      job.data,
      job.data.reason
    );

    if (sentEmail instanceof Error) {
      // We will log here
      console.log(sentEmail.message);
    }
  },
  {
    connection: redisConnection
  }
);

export const adminCancellationEmailWorker = new Worker(
  "Admin-Cancellation-Email",
  async (job: Job<ICancelledAppointment>) => {
    await sendCancellationEmailAdmin(job.data, job.data.reason);
  },
  {
    connection: redisConnection
  }
);

// Worker for message request background jobs
const messageRequestWorker = new Worker(
  "Message-Request",
  async (job: Job<IContact>) => {
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
