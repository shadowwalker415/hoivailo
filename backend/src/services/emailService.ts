import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo
} from "nodemailer";
import pug from "pug";
import config from "../utils/config";

import { IContact, MessagePurpose, Role } from "../types";
import { IAppointment } from "../model/appointment";
import { isRole, isMessagePurpose } from "../utils/parsers";
import dateHelper from "../utils/dateHelper";

// Creating instance of email transporter
const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport(
  config.MAIL_OPTIONS
);

// Appointment notification message constructor
const constructHtmlMessage = (
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
  let html = "";
  let template;
  const locals = {
    date: dateHelper.getDateOfficial(appointment.startTime),
    time: dateHelper.getHourOfficial(appointment.startTime),
    service: appointment.service,
    user: appointment.name,
    phone: appointment.phone,
    email: appointment.email,
    id: appointment.appointmentId,
    reason
  };
  if (role === "admin" && purpose === "confirmation") {
    // Admin appointment confirmation, notification message.
    template = pug.compileFile(
      `${__dirname}/../static/templates/adminAppointmentNotification.pug`
    );
    html = template(locals);
  } else if (role === "user" && purpose === "confirmation") {
    // User appointment confirmation notification message.
    template = pug.compileFile(
      `${__dirname}/../static/templates/userAppointmentConfirmation.pug`
    );
    html = template(locals);
  } else if (role === "admin" && purpose === "cancellation") {
    // Admin appointment cancellation notification message.
    template = pug.compileFile(
      `${__dirname}/../static/templates/adminAppointmentCancellation.pug`
    );
    html = template(locals);
  } else {
    template = pug.compileFile(
      `${__dirname}/../static/templates/userCancellationNotification.pug`
    );
    html = template(locals);
  }
  return html;
};

const sendUserConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<SentMessageInfo | Error> => {
  try {
    // message sample
    const html = constructHtmlMessage(appointmentInfo, "user", "confirmation");
    // mail options
    const mailOptions = {
      from: "No reply example@myname.io",
      to: "your_name@yahoo.com",
      subject: "Ajanvaraus varattu",
      html: html
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
    const html = constructHtmlMessage(appointmentInfo, "admin", "confirmation");

    // mail options
    const mailOptions = {
      from: "No reply example@myname.io",
      to: `${appointmentInfo.email}`,
      subject: "Uusi aika",
      html: html
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
    const html = constructHtmlMessage(
      appointmentInfo,
      "admin",
      "cancellation",
      reason
    );
    // mail option
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: `${appointmentInfo.email}`,
      subject: "Aika peruutettu",
      html: html
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
    const html = constructHtmlMessage(
      appointmentInfo,
      "user",
      "cancellation",
      reason
    );
    // mail option
    const mailOptions: SendMailOptions = {
      from: "No reply example@myname.io",
      to: `${appointmentInfo.email}`,
      subject: "Ajanvarauksesi peruuttanut",
      html: html
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
    const template = pug.compileFile(
      `${__dirname}/../static/templates/newContactNotification.pug`
    );
    const html = template(contactObj);

    // mail options
    const mailOptions: SendMailOptions = {
      from: `No reply example@myname.io`,
      to: `${contactObj.email}`,
      subject: "Uusi viesti",
      html: html
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
