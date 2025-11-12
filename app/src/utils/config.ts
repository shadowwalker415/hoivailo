import dotenv from "dotenv";
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
const REDIS_DEV_HOST = process.env.DEV_REDIS_HOST;
const REDIS_DEV_TCP_PORT = Number(process.env.DEV_REDIS_TCP_PORT);
const REDIS_DEV_PASSWORD = process.env.DEV_REDIS_PASSWORD;

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
  throw new Error("There's an invalid environment variable value for Mailtrap");
}

if (!REDIS_DEV_HOST || !REDIS_DEV_PASSWORD || REDIS_DEV_TCP_PORT) {
  throw new Error(
    "There's an invalid enviroment variable value for redis cloud"
  );
}

export const REDIS_DEV_CONFIG = {
  port: REDIS_DEV_TCP_PORT,
  host: REDIS_DEV_HOST,
  username: "default",
  password: REDIS_DEV_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export default {
  MONGODB_URI,
  PORT,
  ADMIN_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  MAILTRAP_PASSWORD,
  MAILTRAP_USERNAME
};
