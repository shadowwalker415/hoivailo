import { Job, toString } from "bullmq";
import {
  sendAdminConfirmationEmail,
  sendUserConfirmationEmail
} from "../../services/emails";
import {
  createBookedAppointmentEmail,
  markAppointmentEmailSent
} from "../../services/appointments";
import { IAppointment } from "../../model/appointment";

export const appointmentBookedWorker = async (job: Job<IAppointment>) => {
  const id = toString(job.data._id);

  try {
    // Creating user appointment confirmation email record
    await createBookedAppointmentEmail(id, "user");
    // Sending user confirmation email
    await sendUserConfirmationEmail(job.data);
    // Marking booked appointment email as sent for user
    await markAppointmentEmailSent(id, "user");
  } catch (err) {}

  try {
    // creating admin appointment confirmation email record
    await createBookedAppointmentEmail(id, "admin");
    // Sending admin confirmation email
    await sendAdminConfirmationEmail(job.data);
    // Marking booked appointment email as sent for admin
    await markAppointmentEmailSent(id, "admin");
  } catch (err) {}
};
