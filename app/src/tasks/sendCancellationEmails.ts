import { IAppointment } from "../model/appointment";
import {
  sendCancellationEmailUser,
  sendCancellationEmailAdmin
} from "../services/emailService";
import { isEmailSent } from "../utils/helpers";
import InternalServerError from "../errors/internalServerError";

// Async job that runs after an appointment is successfully cancelled
export const sendCancellationEmails = async (
  appointment: IAppointment,
  reason: string
): Promise<void> => {
  try {
    // Sending appointment cancellation notification email to user
    const userEmail = await sendCancellationEmailUser(appointment, reason);
    if (!isEmailSent(userEmail)) {
      throw new InternalServerError({
        message: "Email was not successfully sent",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }

    // Sending appointment cancellation notification email to admin
    const adminEmail = await sendCancellationEmailAdmin(appointment, reason);
    if (!isEmailSent(adminEmail)) {
      throw new InternalServerError({
        message: "Email was not successfully sent",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error || err instanceof InternalServerError) {
      // We will log the error for this failed async job here
      throw new Error(err.message); // This is a place holder
    } else {
      throw new Error("An error occured"); // This is also a place holder
    }
  }
};
