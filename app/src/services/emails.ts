import { SendMailOptions, SentMessageInfo } from "nodemailer";
import { transporter } from "../utils/mailer";

import pug from "pug";
import config from "../utils/config";

import { IServiceInquiry, EmailType, Recipient } from "../types";
import { IAppointment, ICancelledAppointment } from "../model/appointment";
import { isRecipient, isEmailType } from "../utils/parsers";
import { getHourOfficial, getDateOfficial } from "../utils/helpers";
import InternalServerError from "../errors/internalServerError";
import ValidationError from "../errors/validationError";

// HTML template constructor funcion for sending appointment confirmation and cancellation emails
const constructHtmlTemplate = (
  appointment: IAppointment,
  recipient: Recipient,
  emailType: EmailType,
  reason?: string
): string => {
  // Checking if role is a valid role or if the email purpose is a valid purpose
  if (!isRecipient(recipient) || !isEmailType(emailType)) {
    throw new ValidationError({
      message: "Parameters recipient or purpose was invalid",
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
  if (recipient === "admin" && emailType === "confirmation") {
    // Admin appointment confirmation, notification html template.
    template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/adminAppointmentNotification.pug`
    );
    html = template(locals);
  } else if (recipient === "user" && emailType === "confirmation") {
    // User appointment confirmation notification html template.
    template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/userAppointmentConfirmation.pug`
    );
    html = template(locals);
  } else if (recipient === "admin" && emailType === "cancellation") {
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

// Admin confirmation email helper function
export const sendAppointmentBookedEmail = async (
  appointmentInfo: IAppointment,
  recipient: Recipient
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // Message sample
    const html = constructHtmlTemplate(
      appointmentInfo,
      recipient,
      "confirmation"
    );

    // Mail options
    const mailOptions = {
      from: "hello@hoivailo.fi",
      to: `${
        recipient === "user" ? appointmentInfo.email : config.ADMIN_EMAIL
      }`,
      subject: `${recipient === "user" ? "Ajanvaraus varattu" : "uusi aika"}`,
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
export const sendAppointmentCancelledEmail = async (
  appointmentInfo: ICancelledAppointment,
  recipient: Recipient,
  reason?: string
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // Message
    const html = constructHtmlTemplate(
      appointmentInfo,
      recipient,
      "cancellation",
      reason
    );
    // Mail options
    const mailOptions: SendMailOptions = {
      from: "noreply@hoivailo.fi",
      to: `${
        recipient === "user" ? appointmentInfo.email : config.ADMIN_EMAIL
      }`,
      subject: `${
        recipient === "user" ? "Ajanvarauksesi peruuttanut" : "Aika peruutettu"
      }`,
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
export const sendServiceInquiryEmail = async (
  inquiryInfo: IServiceInquiry
): Promise<SentMessageInfo | InternalServerError | ValidationError | Error> => {
  try {
    // Constructing message
    const template = pug.compileFile(
      `${__dirname}/../views/emailTemplates/newContactNotification.pug`
    );
    const html = template(inquiryInfo);

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
