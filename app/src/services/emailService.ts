import { SendMailOptions, SentMessageInfo } from "nodemailer";
import { transporter } from "../utils/mailer";

import pug from "pug";
import config from "../utils/config";

import { IContact, MessagePurpose, Role } from "../types";
import { IAppointment } from "../model/appointment";
import { isRole, isMessagePurpose } from "../utils/parsers";
import { getHourOfficial, getDateOfficial } from "../utils/helpers";
import InternalServerError from "../errors/internalServerError";
import ValidationError from "../errors/validationError";

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
    // Message sample
    const html = constructHtmlTemplate(appointmentInfo, "user", "confirmation");
    // Mail options
    const mailOptions = {
      from: "noreply@hoivailo.fi",
      to: `${appointmentInfo.email}`,
      subject: "Ajanvaraus varattu",
      html: html
    };
    // Sending email
    await transporter.sendMail(mailOptions);
    console.log("This is for user confirmation email and we got here.");
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
    // Message sample
    const html = constructHtmlTemplate(
      appointmentInfo,
      "admin",
      "confirmation"
    );

    // Mail options
    const mailOptions = {
      from: "hello@hoivailo.fi",
      to: `${config.ADMIN_EMAIL}`,
      subject: "Uusi aika",
      html: html
    };
    // Sending email
    await transporter.sendMail(mailOptions); // The problem seems to be here. It doesn't get past this line
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
    // Mail option
    const mailOptions: SendMailOptions = {
      from: "noreply@hoivailo.fi",
      to: `${config.ADMIN_EMAIL}`,
      subject: "Aika peruutettu",
      html: html
    };

    // Sending email
    await transporter.sendMail(mailOptions);
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
    // Mail option
    const mailOptions: SendMailOptions = {
      from: "noreply@hoivailo.fi",
      to: `${appointmentInfo.email}`,
      subject: "Ajanvarauksesi peruuttanut",
      html: html
    };

    // Sending email
    await transporter.sendMail(mailOptions);
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
    // Constructing message
    const template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/newContactNotification.pug`
    );
    const html = template(contactObj);

    // Mail options
    const mailOptions: SendMailOptions = {
      from: `contact@hoivailo.fi`,
      to: `${config.ADMIN_EMAIL}`,
      subject: "Uusi viesti",
      html: html
    };

    // Sending email
    await transporter.sendMail(mailOptions);
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
