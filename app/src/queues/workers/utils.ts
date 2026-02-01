import { Model, Document } from "mongoose";
import {
  AppointmentEmail,
  IAppointmentEmail
} from "../../model/appointmentEmail";
import { SentMessageInfo } from "nodemailer";
import InternalServerError from "../../errors/internalServerError";
import ValidationError from "../../errors/validationError";
import { IAppointment, ICancelledAppointment } from "../../model/appointment";
import { IServiceInquiry, Recipient } from "../../types";
import {
  IServiceInquiryEmail,
  serviceInquiryEmail
} from "../../model/serviceInquiryEmail";

export interface IProcessingData {
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
  recipient: Recipient;
  emailData: IAppointment | ICancelledAppointment;
  sendEmail: (
    data: IAppointment | ICancelledAppointment,
    recipient: Recipient,
    reason?: string
  ) => Promise<SentMessageInfo | InternalServerError | ValidationError | Error>;
}

interface HasEmailStatus extends Document {
  status: "pending" | "sending" | "sent" | "failed";
}
export type AppointmentStatus = "booked" | "cancelled";

// Can be used to create both an appointment booked appointment email records, and cancelled appointment email records.
const getOrCreateAppointmentEmail = async (
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

const getOrCreateServiceInquiryEmail = async (
  sender: string
): Promise<IServiceInquiryEmail | Error> => {
  try {
    const serviceInquiry = serviceInquiryEmail.findOneAndUpdate(
      {
        senderEmail: sender
      },
      {
        $setOnInsert: {
          status: "pending",
          senderEmail: sender
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    // Checking if database write operation failed.
    if (serviceInquiry instanceof Error) {
      throw new Error(serviceInquiry.message);
    }

    return serviceInquiry;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("An unknown error occured on the database");
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

// Can be used for both booked appointment emails, and cancelled appointment emails.
export const processAppointmentEmails = async (
  processingData: IProcessingData
): Promise<void> => {
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

  /*  
    Where a false value means, the email has already been sent by another worker or 
    is in the process of being sent by another worker. 
  */
  const acquired: Boolean = await markEmailSending(AppointmentEmail, email.id);

  // Checking if another worker already sent the email or is sending the email.
  if (!acquired) return;

  try {
    // Checking if the appointment email to be processed is that of a booked appointment.
    if (appointmentStatus === "booked") {
      // Checking if there's a reason field in the cancelled appointment object.
      if ("reason" in emailData) {
        await sendEmail(emailData, recipient, emailData.reason);
      }
    } else {
      await sendEmail(emailData, recipient);
    }

    await markEmailSent(AppointmentEmail, email.id);
  } catch (err: unknown) {
    await markEmailFailed(AppointmentEmail, email.id);
    if (
      err instanceof Error ||
      err instanceof InternalServerError ||
      err instanceof ValidationError
    ) {
      // Throwing same error for job retry.
      throw err;
    }
    // Throwing new error for job retry.
    throw new Error("Job failed due to unknown reasons");
  }
};

export const processServiceInquiryEmail = async (
  inquiryInfo: IServiceInquiry,
  sendEmail: (data: IServiceInquiry) => Promise<SentMessageInfo>
): Promise<void> => {
  const email = await getOrCreateServiceInquiryEmail(inquiryInfo.email);

  if (email instanceof Error) {
    throw new Error(email.message);
  }

  if (email.status === "sent") return;

  const acquired: Boolean = await markEmailSending(
    serviceInquiryEmail,
    email.id
  );

  if (!acquired) return;

  try {
    await sendEmail(inquiryInfo);

    await markEmailSent(serviceInquiryEmail, email.id);
  } catch (err: unknown) {
    markEmailFailed(serviceInquiryEmail, email.id);
    if (err instanceof Error) {
      // Throwing error for job retry.
      throw err;
    }
    // Throwing error for job retry.
    throw new Error("Job failed: An error occured");
  }
};
