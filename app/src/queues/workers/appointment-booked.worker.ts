import { Job } from "bullmq";
import {
  sendAdminConfirmationEmail,
  sendUserConfirmationEmail
} from "../../services/emails";
import { markAppointmentEmailSent } from "../../services/appointments";
import { IAppointment } from "../../model/appointment";

export const appointmentBookedWorker = async (job: Job<IAppointment>) => {
  try {
    const id = job.data.appointmentId;
    if (!id) throw new Error("appointmentId missing");
    await sendUserConfirmationEmail(job.data);
    await sendAdminConfirmationEmail(job.data);
    await markAppointmentEmailSent(id);
  } catch (err: unknown) {}
};
