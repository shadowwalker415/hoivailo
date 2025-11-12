import config from "./config";
import smtpTransport from "nodemailer-smtp-transport";

export const MAIL_OPTIONS = smtpTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  auth: {
    user: config.MAILTRAP_USERNAME,
    pass: config.MAILTRAP_PASSWORD
  }
});
