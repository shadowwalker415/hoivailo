import { Job } from "bullmq";
import { sendServiceInquiryEmail } from "../../services/emails";
import { processServiceInquiryEmail } from "./utils";
import { IServiceInquiry } from "../../types";

export const serviceInquiryWorker = async (
  job: Job<IServiceInquiry>
): Promise<void> => {
  await processServiceInquiryEmail(job.data, sendServiceInquiryEmail);
};
