import dotenv from "dotenv";
import smtpTransport from "nodemailer-smtp-transport";
dotenv.config();
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.MONGODB_TEST
    : process.env.MONGODB_URI;

const PORT = process.env.PORT;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const MAILTRAP_USERNAME = process.env.MAILTRAP_USERNAME;
const MAILTRAP_PASSWORD = process.env.MAILTRAP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT);

if (!MONGODB_URI) {
  throw new Error("Missing MongoDB URI in environment variable");
}

if (!PORT) {
  throw new Error("Missing PORT in environment variable");
}

if (!ADMIN_EMAIL) {
  throw new Error("Missing ADMIN_EMAIL in environmnet viarable");
}

if (!MAILTRAP_PASSWORD || !MAILTRAP_USERNAME || !SMTP_HOST || !SMTP_PORT) {
  throw new Error("There's an invalid environment variable value");
}

let MAIL_OPTIONS = smtpTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: MAILTRAP_USERNAME,
    pass: MAILTRAP_PASSWORD
  }
});

export default {
  MONGODB_URI,
  PORT,
  ADMIN_EMAIL,
  MAIL_OPTIONS
};
