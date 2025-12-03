import { Job, Worker, QueueEvents } from "bullmq";
import { redisConnection } from "../../worker";
import {
  sendContactNotificationEmail,
  sendAdminConfirmationEmail,
  sendUserConfirmationEmail,
  sendCancellationEmailAdmin,
  sendCancellationEmailUser
} from "../../tasks/emails";
import { confirmUserEmail } from "../../tasks/appointments";
import {
  adminConfirmationEmailQueue,
  userRecordUpdateQueue
} from "../queues/queques";
import { addJobsToQueue } from "../../utils/redisHelpers";

import { IAppointment, ICancelledAppointment } from "../../model/appointment";
import { IContact } from "../../types";
import InternalServerError from "../../errors/internalServerError";
import EntityNotFoundError from "../../errors/entityNotFoundError";

export const userConfirmationEmailWorker = new Worker(
  "user-confirmation-email",
  async (job: Job<IAppointment>) => {
    console.log("user confirmation email job started");
    const sentEmail = await sendUserConfirmationEmail(job.data);
    if (sentEmail instanceof Error) {
      // We will log here
      throw sentEmail;
    }
    return JSON.stringify(job.data);
  },
  {
    connection: redisConnection
  }
);

export const adminConfirmationEmailWorker = new Worker(
  "admin-confirmation-email",
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
  "update-user-record",
  async (job: Job<IAppointment>) => {
    console.log("Processing update user record job");
    if (!job.data.appointmentId) {
      return;
    }
    console.log(typeof job.data.appointmentId);
    const updatedRecord = await confirmUserEmail(job.data.appointmentId);
    if (
      updatedRecord instanceof Error ||
      updatedRecord instanceof InternalServerError
    ) {
      console.log(updatedRecord.message);
      throw updatedRecord;
    }
    console.log("Update user record job completed");
  },
  {
    connection: redisConnection
  }
);

userRecordUpdateWorker.on("failed", (error) => {
  if (error instanceof Error)
    console.log("user record update job failed.", error.message);
});

userRecordUpdateWorker.on("completed", () => {
  console.log("user record update job completed");
});

export const userCancellationEmailWorker = new Worker(
  "user-cancellation-email",
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
  "admin-cancellation-email",
  async (job: Job<ICancelledAppointment>) => {
    await sendCancellationEmailAdmin(job.data, job.data.reason);
  },
  {
    connection: redisConnection
  }
);

// Worker for message request background jobs
const messageRequestWorker = new Worker(
  "message-request",
  async (job: Job<IContact>) => {
    await sendContactNotificationEmail(job.data);
  },
  {
    connection: redisConnection
  }
);

export const userConfirmationEmailQueueEvent = new QueueEvents(
  "user-confirmation-email",
  {
    connection: redisConnection.duplicate()
  }
);

export const userRecordUpdateQueueEvent = new QueueEvents(
  "update-user-record",
  {
    connection: redisConnection.duplicate()
  }
);

userConfirmationEmailQueueEvent.on("completed", async ({ returnvalue }) => {
  if (!returnvalue) {
    return;
  }
  // Parsing the return value of the completed job in the respective queue
  const appointment = JSON.parse(returnvalue) as IAppointment;
  if (!appointment) {
    // We will log here and then return instead of throwing an error
    throw new EntityNotFoundError({
      message: "return value is undefined",
      statusCode: 404,
      code: "NOT_FOUND"
    });
  }
  await addJobsToQueue(
    userRecordUpdateQueue,
    "confirm-user-email",
    appointment
  );
});

userRecordUpdateQueueEvent.on("completed", async ({ jobId }) => {
  const completedJob = await userRecordUpdateQueue.getJob(jobId);
  if (!completedJob) {
    return;
  }
  await addJobsToQueue(
    adminConfirmationEmailQueue,
    "admin-email-confirmation",
    completedJob.data
  );
});

userConfirmationEmailQueueEvent.on("failed", ({ jobId, failedReason }) => {
  console.log("Job failed:", jobId, failedReason);
});

userConfirmationEmailQueueEvent.on("error", console.error);

userConfirmationEmailWorker.on("completed", (job) => {
  console.log("User confirmation email job completed. Job ID is" + job.id);
});

messageRequestWorker.on("failed", (job, err) => {
  // We will log the error here
  console.error("Job failed:", job?.id, err);
});
