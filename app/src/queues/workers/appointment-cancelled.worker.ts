import { Job } from "bullmq";
import {
  sendCancellationEmailAdmin,
  sendCancellationEmailUser
} from "../../services/emails";
import { ICancelledAppointment } from "../../model/appointment";

export const appointmentCancelledWorker = async (
  job: Job<ICancelledAppointment>
) => {
  try {
    await sendCancellationEmailUser(job.data, job.data.reason);
    await sendCancellationEmailAdmin(job.data, job.data.reason);
  } catch (err: unknown) {}
};
