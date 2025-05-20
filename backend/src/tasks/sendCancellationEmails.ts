import { IAppointment } from "../model/appointment";
import emailService from "../services/emailService";
import helpers from "../utils/helpers";

// Async job that runs after an appointment is successfully cancelled
export const sendCancellationEmails = async (
  appointment: IAppointment,
  reason: string
): Promise<void> => {
  try {
    // Sending appointment cancellation notification email to user
    const userEmail = await emailService.sendCancellationEmailUser(
      appointment,
      reason
    );
    if (!helpers.isEmailSent(userEmail)) {
      throw new Error("Failed to send cancellation email to user");
    }

    // Sending appointment cancellation notification email to admin
    const adminEmail = await emailService.sendCancellationEmailAdmin(
      appointment,
      reason
    );
    if (!helpers.isEmailSent(adminEmail)) {
      throw new Error("Failed to send cancellation email to admin");
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("An error occured");
  }
};
