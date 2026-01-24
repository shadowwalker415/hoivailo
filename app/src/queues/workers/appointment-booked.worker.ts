import { Job } from "bullmq";

import { sendAppointmentBookedEmail } from "../../services/emails";
import { IAppointment } from "../../model/appointment";

export const appointmentBookedWorker = async (job: Job<IAppointment>) => {
  try {
    await sendAppointmentBookedEmail(job.data, "user");
    await sendAppointmentBookedEmail(job.data, "admin");
  } catch (err: unknown) {}
};
