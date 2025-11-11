import { Queue } from "bullmq";

export const confirmationEmailQueue = new Queue("Confirmation-Email");
export const userEmailConfirmationQueue = new Queue("Confirm-User-Email");
export const cancellationEmailQueue = new Queue("Cancellation-Email");
export const messageRequestQueue = new Queue("Message-Request");
