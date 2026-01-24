import { Model, Document } from "mongoose";
import {
  AppointmentEmail,
  IAppointmentEmail
} from "../../model/appointmentEmail";
import { SentMessageInfo } from "nodemailer";
import InternalServerError from "../../errors/internalServerError";
import ValidationError from "../../errors/validationError";
import { IAppointment } from "../../model/appointment";
import { Recipient } from "../../types";

interface HasEmailStatus extends Document {
  status: "pending" | "sending" | "sent" | "failed";
}
export type AppointmentStatus = "booked" | "cancelled";

// Can be used to create both an appointment booked appointment email records, and cancelled appointment email records.
export const getOrCreateAppointmentEmail = async (
  appointmentId: string,
  recipient: Recipient,
  appointmentStatus: AppointmentStatus
): Promise<IAppointmentEmail | Error> => {
  try {
    const appointmentEmail = await AppointmentEmail.findOneAndUpdate(
      {
        appointmentId,
        appointmentStatus,
        recipient
      },
      {
        $setOnInsert: {
          appointmentId,
          appointmentStatus,
          recipient,
          status: "pending"
        }
      },
      {
        new: true,
        upsert: true
      }
    );
    return appointmentEmail;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("An unkown error occured");
  }
};

const markEmailSending = async <T extends HasEmailStatus>(
  model: Model<T>,
  emailId: string
): Promise<Boolean> => {
  const updateWriteResult = await model.updateOne(
    {
      _id: emailId,
      status: { $in: ["pending", "failed"] }
    },
    {
      $set: { status: "sending" }
    }
  );

  return updateWriteResult.modifiedCount === 1;
};

const markEmailSent = async <T extends HasEmailStatus>(
  model: Model<T>,
  emailId: string
): Promise<void> => {
  try {
    await model.updateOne({ _id: emailId }, { $set: { status: "sent" } });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("An unknown error occured on the database.");
  }
};

const markEmailFailed = async <T extends HasEmailStatus>(
  model: Model<T>,
  emailId: string
): Promise<void> => {
  try {
    await model.updateOne(
      { _id: emailId },
      {
        $set: { status: "failed" }
      }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("An unknown error occured on the database.");
  }
};

interface IProcessingData {
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
  recipient: Recipient;
  emailData: IAppointment;
  sendEmail: (
    data: IAppointment
  ) => Promise<SentMessageInfo | InternalServerError | ValidationError | Error>;
}

// Can be used for both booked appointment emails, and cancelled appointment emails.
export const processAppointmentEmails = async (
  processingData: IProcessingData
) => {
  const { appointmentId, recipient, appointmentStatus, emailData, sendEmail } =
    processingData;

  const email = await getOrCreateAppointmentEmail(
    appointmentId,
    recipient,
    appointmentStatus
  );
  if (email instanceof Error) {
    throw new Error(email.message);
  }

  // Checking if the email has already been sent.
  if (email.status === "sent") {
    return;
  }

  const isSending = await markEmailSending(AppointmentEmail, email.id);

  if (!isSending) return;

  try {
    await sendEmail(emailData);

    await markEmailSent(AppointmentEmail, email.id);
  } catch (err: unknown) {
    await markEmailFailed(AppointmentEmail, email.id);
    if (
      err instanceof Error ||
      err instanceof InternalServerError ||
      err instanceof ValidationError
    ) {
      // Throwing error so that BullMQ retries job.
      throw new Error(err.message);
    }
    // Throwing error for job retry
    throw new Error("Job failed due to unknown reasons");
  }
};
