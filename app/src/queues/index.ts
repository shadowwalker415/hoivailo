import {
  registerServiceInquiryQueue,
  registerServiceInquiryQueueAPI
} from "./service-inquiry.queue";
import {
  registerAppointmentBookedQueue,
  registerAppointmentBookedQueueAPI
} from "./appointment-booked.queue";
import {
  registerAppointmentCancelledQueue,
  registerAppointmentCancelledQueueAPI
} from "./appointment-cancelled.queue";

export const initQueuesForWorker = () => {
  registerServiceInquiryQueue();
  registerAppointmentBookedQueue();
  registerAppointmentCancelledQueue();
};

export const initQueusForAPI = () => {
  registerAppointmentBookedQueueAPI();
  registerAppointmentCancelledQueueAPI();
  registerServiceInquiryQueueAPI();
};
