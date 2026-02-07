import { registerQueue } from "./registry";
import { appointmentBookedWorker } from "./workers/appointment-booked.worker";

export const APPOINTMENT_BOOKED_QUEUE = "appointment-booked";

// Register appointment booked queue for worker process.
export const registerAppointmentBookedQueue = () => {
  registerQueue(APPOINTMENT_BOOKED_QUEUE, {
    worker: appointmentBookedWorker
  });
};

// Register appointment booked queue for API process.
export const registerAppointmentBookedQueueAPI = () => {
  registerQueue(APPOINTMENT_BOOKED_QUEUE, {});
};
