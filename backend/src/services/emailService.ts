import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import config from "../utils/config";
import { IAppointment, MessagePurpose, Role } from "../types";
import { isRole, isMessagePurpose } from "../utils/parsers";
import dateHelper from "../utils/dateHelper";

// creating email transporter
const transporter: Transporter = nodemailer.createTransport(
  config.MAIL_OPTIONS
);

// const isSendSuccessful = (): boolean => {
//   return;
// };

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
): Promise<any | Error> => {
  try {
    // message sample
    const message = constructMessage(appointmentInfo, "user", "confirmation");
    // mail options
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: "your_name@yahoo.com",
      subject: "Appointment confirmation",
      text: message
    };
    // sending email
    const responseObj = await transporter.sendMail(mailOptions);
    if (!responseObj) throw new Error("Something went wrong sending email");
    return responseObj;
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

const sendAdminConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<any | Error> => {
  try {
    // message sample
    const message = constructMessage(appointmentInfo, "admin", "confirmation");
    // mail options
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: "admin_service@yahoo.com",
      subject: "New Appointment",
      text: message
    };
    // sending email
    const responseObj = await transporter.sendMail(mailOptions);
    if (!responseObj) throw new Error("Something went wrong sending email");
    return responseObj;
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

const sendCancellationEmailAdmin = async (
  appointmentInfo: IAppointment,
  reason: string
) => {
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
    const responseObj = await transporter.sendMail(mailOptions);
    if (!responseObj) throw new Error("Something went wrong sending email");
    return responseObj;
  } catch (err: unknown) {}
};

const sendCancellationEmailUser = async (
  appointmentInfo: IAppointment,
  reason: string
) => {
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
    const responseObj = await transporter.sendMail(mailOptions);
    if (!responseObj) throw new Error("Something went wrong sending email");
    return responseObj;
  } catch (err: unknown) {}
};

export default {
  sendUserConfirmationEmail,
  sendAdminConfirmationEmail,
  sendCancellationEmailAdmin,
  sendCancellationEmailUser
};
