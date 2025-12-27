import { registerAdminMessageRequestedQueue } from "./admin-message-requested.queue";
import { registerAppointmentBookedQueue } from "./appointment-booked.queue";
import { registerAppointmentCancelledQueue } from "./appointment-cancelled.queue";

export const initQueues = () => {
  registerAdminMessageRequestedQueue();
  registerAppointmentBookedQueue();
  registerAppointmentCancelledQueue();
};
