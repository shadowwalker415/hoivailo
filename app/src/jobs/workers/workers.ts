import { Worker } from "bullmq";
import { redisConnection } from "../../worker";
import { contactAdmin } from "../../tasks/contactAdmin";

// export const confirmationEmailWorker = new Worker(
//   "Confirmation-Email",
//   async (job) => {},
//   {
//     connection: redisConnection
//   }
// );
// export const userEmailConfirmationWorker = new Worker(
//   "Confirm-User-Email",
//   async (job) => {},
//   {
//     connection: redisConnection
//   }
// );
// export const cancellationEmailWorker = new Worker(
//   "Cancellation-Email",
//   async (job) => {},
//   {
//     connection: redisConnection
//   }
// );
const messageRequestWorker = new Worker(
  "Message-Request",
  async (job) => {
    await contactAdmin(job.data);
  },
  {
    connection: redisConnection
  }
);

messageRequestWorker.on("completed", () => {
  console.log("message-request job completed");
});
