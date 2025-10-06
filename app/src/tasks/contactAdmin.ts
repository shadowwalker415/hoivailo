import InternalServerError from "../errors/internalServerError";
import { sendContactNotificationEmail } from "../services/emailService";
import { IContact } from "../types";

// An async job for sending Contact-Us email notifications to admin
export const contactAdmin = async (data: IContact): Promise<void> => {
  try {
    await sendContactNotificationEmail(data);
  } catch (err: unknown) {
    if (err instanceof Error || err instanceof InternalServerError) {
      // We will log the error here
      throw new Error(err.message); // This is just a place holder
    } else {
      throw new Error("An unknown error occured"); // Still just a place holder
    }
  }
};
