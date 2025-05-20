import { IAppointment } from "../model/appointment";
import emailService from "../services/emailService";
import appointmentService from "../services/appointmentService";
import helpers from "../utils/helpers";

// Async job that runs after an appointment is successfully booked
export const sendAppointmentEmails = async (
  appointment: IAppointment
): Promise<void> => {
  try {
    // Sending appointment confirmation notification email to user
    const sentUserEmail = await emailService.sendUserConfirmationEmail(
      appointment
    );
    // Checking if email was successfully sent to the user
    if (!helpers.isEmailSent(sentUserEmail)) {
      throw new Error("Failed to send email to user");
    }

    //Updating the appointment emailSent field
    const confirmedAppointment = await appointmentService.confirmUserEmail(
      appointment
    );
    // Checking if the update was successful
    if (confirmedAppointment instanceof Error)
      throw new Error(
        "An error occured on the database server: Couldn't confirm appointment email"
      );
    // Sending new appointment notification email to admin
    const adminEmail = await emailService.sendAdminConfirmationEmail(
      confirmedAppointment
    );
    if (!helpers.isEmailSent(adminEmail)) {
      throw new Error("Failed to send email to Admin");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("An error occured");
  }
};
