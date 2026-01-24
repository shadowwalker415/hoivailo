import { Job } from "bullmq";
import { sendContactNotificationEmail } from "../../services/emails";
import { IContact } from "../../types";
import { Recipient } from "../../model/appointmentEmail";

const processServiceInquryEmail = async (
  appointmentId: string,
  recipient: Recipient,
  sendEmail: () => Promise<void>
) => {};

export const serviceInquiryWorker = async (job: Job<IContact>) => {
  try {
    await sendContactNotificationEmail(job.data);
  } catch (err: unknown) {}
};
