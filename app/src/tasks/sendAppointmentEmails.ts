import { IAppointment } from "../model/appointment";
import {
  sendUserConfirmationEmail,
  sendAdminConfirmationEmail
} from "../services/emailService";
import { confirmUserEmail } from "../services/appointmentService";
import { isEmailSent } from "../utils/helpers";
import InternalServerError from "../errors/internalServerError";

// Async job that runs after an appointment is successfully booked
export const sendAppointmentEmails = async (
  appointment: IAppointment
): Promise<void> => {
  try {
    // Sending appointment confirmation notification email to user
    const sentUserEmail = await sendUserConfirmationEmail(appointment);
    // Checking if email was successfully sent to the user
    if (isEmailSent(sentUserEmail)) {
      throw new InternalServerError({
        message: "Email was not successfully sent",
        statusCode: 500
      });
    }

    // Updating the appointment emailSent field
    const confirmedAppointment = await confirmUserEmail(appointment);
    // Checking if the database update operation was successful
    if (confirmedAppointment instanceof Error)
      throw new InternalServerError({
        message: "An error occured on the database",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });

    // Sending new appointment notification email to admin
    const adminEmail = await sendAdminConfirmationEmail(confirmedAppointment);
    if (!isEmailSent(adminEmail)) {
      throw new InternalServerError({
        message: "Email was not successfully sent",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error || err instanceof InternalServerError) {
      // We will log error on this line since this is an async job.
      throw new Error(err.message); // This is a place holder.
    } else {
      // We will also log error here.
      throw new Error("An error occured"); // This is also a place holder
    }
  }
};
