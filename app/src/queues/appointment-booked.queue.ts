import { registerQueue } from "./registry";
import { appointmentBookedWorker } from "./workers/appointment-booked.worker";

export const APPOINTMENT_BOOKED_QUEUE = "admin_message_requested";

export const registerAppointmentBookedQueue = () => {
  registerQueue(APPOINTMENT_BOOKED_QUEUE, {
    worker: appointmentBookedWorker
  });
};
