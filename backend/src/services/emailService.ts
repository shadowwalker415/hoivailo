import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo
} from "nodemailer";
import config from "../utils/config";

import { IAppointment, IContact, MessagePurpose, Role } from "../types";
import { isRole, isMessagePurpose } from "../utils/parsers";
import dateHelper from "../utils/dateHelper";

// creating instance of email transporter
const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport(
  config.MAIL_OPTIONS
);

// Appointment notification message constructor
const constructMessage = (
  appointment: IAppointment,
  role: Role,
  purpose: MessagePurpose,
  reason?: string
): string => {
  // Checking if role is a valid role or if the email purpose is a valid purpose
  if (!isRole(role) || !isMessagePurpose(purpose)) {
    throw new Error(
      "The user role must be a valid role and the message purpose must be a valid message purpose"
    );
  }
  let message = "";
  if (role === "admin" && purpose === "confirmation") {
    // Admin appointment confirmation, notification message.
    message = `An appointment was booked for ${dateHelper.getDateOfficial(
      appointment.startTime
    )} from ${dateHelper.getHourOfficial(
      appointment.startTime
    )} with an appointment ID of ${
      appointment.appointmentId
    }.\n Appointment Details\n Customer name: ${appointment.name}\n Phone: ${
      appointment.phone
    }\n Email: ${appointment.email}\n End Time: ${dateHelper.getHourOfficial(
      appointment.endTime
    )}\n Service: ${appointment.service}`;
  } else if (role === "user" && purpose === "confirmation") {
    // User appointment confirmation notification message.
    message = `Hei ${appointment.name},\n 
  This is a confirmation email for your appointment on the ${dateHelper.getDateOfficial(
    appointment.startTime
  )} from ${dateHelper.getHourOfficial(appointment.startTime)}`;
  } else if (role === "admin" && purpose === "cancellation") {
    // Admin appointment cancellation notification message.
    message = `Hei,\n The appointment with appointment ID ${
      appointment.appointmentId
    }, 
    on the ${dateHelper.getDateOfficial(
      appointment.startTime
    )}, at ${dateHelper.getHourOfficial(
      appointment.startTime
    )} has been cancelled.\n
    Reason: ${reason ? reason : "N/A"}`;
  } else {
    // User appointment cancellation notification message.
    message = `Hei,\n Your appointment on the ${dateHelper.getDateOfficial(
      appointment.startTime
    )} at ${dateHelper.getHourOfficial(
      appointment.startTime
    )} has been cancelled.\n Reason\n ${reason ? reason : "N/A"}`;
  }
  return message;
};

const sendUserConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<SentMessageInfo | Error> => {
  try {
    // message sample
    const message = constructMessage(appointmentInfo, "user", "confirmation");
    // mail options
    const mailOptions = {
      from: "No reply example@myname.io",
      to: "your_name@yahoo.com",
      subject: "Appointment confirmation",
      text: message
    };
    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    return responseObj;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("Couldn't send email");
  }
};

const sendAdminConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<SentMessageInfo | Error> => {
  try {
    // message sample
    const message = constructMessage(appointmentInfo, "admin", "confirmation");
    // mail options
    const mailOptions = {
      from: "No reply example@myname.io",
      to: "admin_service@yahoo.com",
      subject: "New Appointment",
      text: message
    };
    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    return responseObj;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("Couldn't send email");
  }
};

const sendCancellationEmailAdmin = async (
  appointmentInfo: IAppointment,
  reason: string
): Promise<SentMessageInfo | Error> => {
  try {
    // Message
    const message = constructMessage(
      appointmentInfo,
      "admin",
      "cancellation",
      reason
    );
    // mail option
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: "your_name@yahoo.com",
      subject: "Appointment has been cancelled!",
      text: message
    };

    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    return responseObj;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("Couldn't send email");
  }
};

const sendCancellationEmailUser = async (
  appointmentInfo: IAppointment,
  reason: string
): Promise<SentMessageInfo | Error> => {
  try {
    // Message
    const message = constructMessage(
      appointmentInfo,
      "user",
      "cancellation",
      reason
    );
    // mail option
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: "your_name@yahoo.com",
      subject: "Your Appointment has been cancelled!",
      text: message
    };

    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    return responseObj;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("Couldn't send email");
  }
};

const sendContactNotificationEmail = async (
  contactObj: IContact
): Promise<SentMessageInfo | Error> => {
  try {
    // constructing message
    const message = `Name: ${contactObj.name}\n Phone: ${contactObj.phone}\n Email: ${contactObj.email}\n Message:\n ${contactObj.message}`;

    // mail options
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: "your_name@yahoo.com",
      subject: "New Contact Request",
      text: message
    };

    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    return responseObj;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("Couldn't send email");
  }
};

export default {
  sendUserConfirmationEmail,
  sendAdminConfirmationEmail,
  sendCancellationEmailAdmin,
  sendCancellationEmailUser,
  sendContactNotificationEmail
};
