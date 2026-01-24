import { registerServiceInquiryQueue } from "./service-inquiry.queue";
import { registerAppointmentBookedQueue } from "./appointment-booked.queue";
import { registerAppointmentCancelledQueue } from "./appointment-cancelled.queue";

export const initQueues = () => {
  registerServiceInquiryQueue();
  registerAppointmentBookedQueue();
  registerAppointmentCancelledQueue();
};
