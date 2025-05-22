import dotenv from "dotenv";
import smtpTransport from "nodemailer-smtp-transport";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SERVICE_USERNAME = process.env.SERVICE_USERNAME;
const SERVICE_PASSWORD = process.env.SERVICE_PASSWORD;
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

if (!SERVICE_PASSWORD || !SERVICE_USERNAME || !SMTP_HOST || !SMTP_PORT) {
  throw new Error("There's an invalid environment variable value");
}

let MAIL_OPTIONS = smtpTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SERVICE_USERNAME,
    pass: SERVICE_PASSWORD
  }
});

export default {
  MONGODB_URI,
  PORT,
  ADMIN_EMAIL,
  MAIL_OPTIONS
};
