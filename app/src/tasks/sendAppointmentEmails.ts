import { IAppointment } from "../model/appointment";
import {
  sendUserConfirmationEmail,
  sendAdminConfirmationEmail
} from "../services/emailService";
import { confirmUserEmail } from "../services/appointmentService";
import InternalServerError from "../errors/internalServerError";
import ValidationError from "../errors/validationError";

// Async job that runs after an appointment is successfully booked
export const sendAppointmentEmails = async (
  appointment: IAppointment
): Promise<void> => {
  try {
    // Updating the appointment emailSent field
    const confirmedAppointment = await confirmUserEmail(appointment);
    // Checking if the database update operation was successful
    if (confirmedAppointment instanceof Error)
      throw new InternalServerError({
        message: "An error occured on the database",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });

    // Due to Mailtrap free plan only one email is sent for the time being.

    // Sending new appointment notification email to admin
    await sendAdminConfirmationEmail(confirmedAppointment);

    // Sending appointment confirmation notification email to user
    const userNotification = await sendUserConfirmationEmail(
      confirmedAppointment
    );
    if (
      userNotification instanceof Error ||
      userNotification instanceof InternalServerError ||
      userNotification instanceof ValidationError
    ) {
      console.log(userNotification.message);
    }
    // Checking if email was successfully sent to the user
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
