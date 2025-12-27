import { Job } from "bullmq";
import { sendContactNotificationEmail } from "../../services/emails";
import { IContact } from "../../types";

export const adminMessageRequestedWorker = async (job: Job<IContact>) => {
  try {
    await sendContactNotificationEmail(job.data);
  } catch (err: unknown) {}
};
