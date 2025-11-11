import { Worker } from "bullmq";

export const confirmationEmailWorker = new Worker("Confirmation-Email");
export const userEmailConfirmationWorker = new Worker("Confirm-User-Email");
export const cancellationEmailWorker = new Worker("Cancellation-Email");
export const messageRequestWorker = new Worker("Message-Request");
