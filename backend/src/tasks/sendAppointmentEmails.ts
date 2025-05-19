import { IAppointment } from "../model/appointment";
import emailService from "../services/emailService";
import appointmentService from "../services/appointmentService";

// Async job that runs after an appointment is successfully booked
export const sendAppointmentEmails = async (
  appointment: IAppointment
): Promise<void> => {
  try {
    // Sending appointment confirmation notification email to user
    const sentUserEmail = await emailService.sendUserConfirmationEmail(
      appointment
    );
    if (!sentUserEmail) throw new Error("Failed to send email");

    //Confirming email notification has been sent to user
    const confirmedAppointment = await appointmentService.confirmUserEmail(
      appointment
    );
    if (confirmedAppointment instanceof Error)
      throw new Error("User confirmation email failed to send");
    // Sending new appointment notification email to admin
    await emailService.sendAdminConfirmationEmail(confirmedAppointment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("An error occured");
  }
};

// Async job that runs after an appointment is successfully cancelled
export const sendCancellationEmails = async (
  appointment: IAppointment,
  reason: string
): Promise<void> => {
  try {
    // Sending appointment cancellation notification email to user
    await emailService.sendCancellationEmailUser(appointment, reason);

    // Sending appointment cancellation notification email to admin
    await emailService.sendCancellationEmailAdmin(appointment, reason);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("An error occured");
  }
};
