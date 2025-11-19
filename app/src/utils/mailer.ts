import nodemailer, { Transporter, SentMessageInfo } from "nodemailer";
import config from "./config";
import smtpTransport from "nodemailer-smtp-transport";

const MAIL_OPTIONS = smtpTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: {
    user: config.MAILTRAP_USERNAME,
    pass: config.MAILTRAP_PASSWORD
  }
});

// Creating instance of Nodemailer's email transporter
export const transporter: Transporter<SentMessageInfo> =
  nodemailer.createTransport(MAIL_OPTIONS);
