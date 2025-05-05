import dotenv from "dotenv";
dotenv.config();
import SMTPTransport from "nodemailer/lib/smtp-transport";

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const SERVICE_USERNAME = process.env.SERVICE_USERNAME;
const SERVICE_PASSWORD = process.env.SERVICE_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL_ADDRESS;

if (!MONGODB_URI) {
  throw new Error("Missing MongoDB URI in environment variable");
}

if (!PORT) {
  throw new Error("Missing PORT in environment variable");
}

if (
  !SERVICE_PASSWORD ||
  !SERVICE_USERNAME ||
  !SMTP_HOST ||
  !SMTP_PORT ||
  !ADMIN_EMAIL
) {
  throw new Error("There's an invalid environment variable value");
}

const MAIL_OPTIONS: SMTPTransport.Options = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SERVICE_USERNAME,
    pass: SERVICE_PASSWORD
  }
};

export default {
  MONGODB_URI,
  PORT,
  MAIL_OPTIONS,
  ADMIN_EMAIL
};
