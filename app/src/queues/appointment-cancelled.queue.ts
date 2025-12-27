import { registerQueue } from "./registry";
import { appointmentCancelledWorker } from "./workers/appointment-cancelled.worker";

export const APPOINTMENT_CANCELLED_QUEUE = "admin_message_requested";

export const registerAppointmentCancelledQueue = () => {
  registerQueue(APPOINTMENT_CANCELLED_QUEUE, {
    worker: appointmentCancelledWorker
  });
};
