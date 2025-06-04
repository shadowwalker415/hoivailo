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
import {
  getHourOfficial,
  getDateOfficial,
  isEmailSent
} from "../utils/helpers";
import InternalServerError from "../errors/internalServerError";
import ValidationError from "../errors/validationError";

// Creating instance of Nodemailer's email transporter
const transporter: Transporter<SentMessageInfo> = nodemailer.createTransport(
  config.MAIL_OPTIONS
);

// HTML template constructor funcion for sending appointment confirmation and cancellation emails
const constructHtmlTemplate = (
  appointment: IAppointment,
  role: Role,
  purpose: MessagePurpose,
  reason?: string
): string => {
  // Checking if role is a valid role or if the email purpose is a valid purpose
  if (!isRole(role) || !isMessagePurpose(purpose)) {
    throw new ValidationError({
      message: "Function parameters role or purpose was invalide",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  let html = "";
  let template;
  const locals = {
    date: getDateOfficial(appointment.startTime),
    time: getHourOfficial(appointment.startTime),
    service: appointment.service,
    user: appointment.name,
    phone: appointment.phone,
    email: appointment.email,
    id: appointment.appointmentId,
    reason
  };
  if (role === "admin" && purpose === "confirmation") {
    // Admin appointment confirmation, notification html template.
    template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/adminAppointmentNotification.pug`
    );
    html = template(locals);
  } else if (role === "user" && purpose === "confirmation") {
    // User appointment confirmation notification html template.
    template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/userAppointmentConfirmation.pug`
    );
    html = template(locals);
  } else if (role === "admin" && purpose === "cancellation") {
    // Admin appointment cancellation notification html template.
    template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/adminAppointmentCancellation.pug`
    );
    html = template(locals);
  } else {
    // User appointment cancellation notification html template.
    template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/userCancellationNotification.pug`
    );
    html = template(locals);
  }
  return html;
};

//User confirmation email helper function
export const sendUserConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // message sample
    const html = constructHtmlTemplate(appointmentInfo, "user", "confirmation");
    // mail options
    const mailOptions = {
      from: "No reply noreply@hoivailo.fi",
      to: `${appointmentInfo.email}`,
      subject: "Ajanvaraus varattu",
      html: html
    };
    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    if (!isEmailSent(responseObj)) {
      throw new InternalServerError({
        message: "Email failed to send",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return responseObj;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof ValidationError ||
      err instanceof Error
    ) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// Admin confirmation email helper function
export const sendAdminConfirmationEmail = async (
  appointmentInfo: IAppointment
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // message sample
    const html = constructHtmlTemplate(
      appointmentInfo,
      "admin",
      "confirmation"
    );

    // mail options
    const mailOptions = {
      from: "No reply noreply@hoivailo.fi",
      to: `Hoivailo Oy ${config.ADMIN_EMAIL}`,
      subject: "Uusi aika",
      html: html
    };
    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    if (!isEmailSent(responseObj)) {
      throw new InternalServerError({
        message: "Email failed to send",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return responseObj;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof ValidationError ||
      err instanceof Error
    ) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// Admin cancellation email helper function
export const sendCancellationEmailAdmin = async (
  appointmentInfo: IAppointment,
  reason: string
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // Message
    const html = constructHtmlTemplate(
      appointmentInfo,
      "admin",
      "cancellation",
      reason
    );
    // mail option
    const mailOptions: SendMailOptions = {
      from: "No reply noreply@hoivailo.fi",
      to: `Hoivailo Oy ${config.ADMIN_EMAIL}`,
      subject: "Aika peruutettu",
      html: html
    };

    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    if (!isEmailSent(responseObj)) {
      throw new InternalServerError({
        message: "Email failed to send",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return responseObj;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof ValidationError ||
      err instanceof Error
    ) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// User cancellation email helper function
export const sendCancellationEmailUser = async (
  appointmentInfo: IAppointment,
  reason: string
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // Message
    const html = constructHtmlTemplate(
      appointmentInfo,
      "user",
      "cancellation",
      reason
    );
    // mail option
    const mailOptions: SendMailOptions = {
      from: "No reply noreply@hoivailo.fi",
      to: `${appointmentInfo.name} ${appointmentInfo.email}`,
      subject: "Ajanvarauksesi peruuttanut",
      html: html
    };

    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    if (!isEmailSent(responseObj)) {
      throw new InternalServerError({
        message: "Email failed to send",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return responseObj;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof ValidationError ||
      err instanceof Error
    ) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// Contact-us email notification helper function
export const sendContactNotificationEmail = async (
  contactObj: IContact
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // constructing message
    const template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/newContactNotification.pug`
    );
    const html = template(contactObj);

    // mail options
    const mailOptions: SendMailOptions = {
      from: `No reply contact@hoivailo.fi`,
      to: `Hoivailo Oy ${config.ADMIN_EMAIL}`,
      subject: "Uusi viesti",
      html: html
    };

    // sending email
    const responseObj: SentMessageInfo = await transporter.sendMail(
      mailOptions
    );
    if (!isEmailSent(responseObj)) {
      throw new InternalServerError({
        message: "Email failed to send",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return responseObj;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof ValidationError ||
      err instanceof Error
    ) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};
