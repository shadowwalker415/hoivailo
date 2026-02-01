import { registerQueue } from "./registry";
import { appointmentCancelledWorker } from "./workers/appointment-cancelled.worker";

export const APPOINTMENT_CANCELLED_QUEUE = "appointment-cancelled";

// Register appointment booked queue for worker process.
export const registerAppointmentCancelledQueue = () => {
  registerQueue(APPOINTMENT_CANCELLED_QUEUE, {
    worker: appointmentCancelledWorker
  });
};

// Register appointment cancelled queue for API process.
export const registerAppointmentCancelledQueueAPI = () => {
  registerQueue(APPOINTMENT_CANCELLED_QUEUE, {});
};
