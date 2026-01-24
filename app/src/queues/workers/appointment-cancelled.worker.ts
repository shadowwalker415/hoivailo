import { Job } from "bullmq";
import { sendAppointmentCancelledEmail } from "../../services/emails";
import { ICancelledAppointment } from "../../model/appointment";

export const processAppointmentCancelledEmails = async () => {};

export const appointmentCancelledWorker = async (
  job: Job<ICancelledAppointment>
) => {
  try {
    await sendAppointmentCancelledEmail(job.data, "user", job.data.reason);
    await sendAppointmentCancelledEmail(job.data, "admin", job.data.reason);
  } catch (err: unknown) {}
};
