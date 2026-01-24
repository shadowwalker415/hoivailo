import { registerQueue } from "./registry";
import { serviceInquiryWorker } from "./workers/service-inquiry.worker";
export const SERVICE_INQUIRY_QUEUE = "service-inquiry";

export const registerServiceInquiryQueue = () => {
  registerQueue(SERVICE_INQUIRY_QUEUE, {
    worker: serviceInquiryWorker
  });
};
