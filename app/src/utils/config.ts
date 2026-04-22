import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.MONGODB_TEST
    : process.env.NODE_ENV === "development"
      ? process.env.MONGODB_DEV
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
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_BASE_URL
    : process.env.PROD_BASE_URL;

const RETRY_ATTEMPTS =
  process.env.NODE_ENV === "production"
    ? Number(process.env.RETRY_ATTEMPTS)
    : 3;

const RETRY_DELAY =
  process.env.NODE_ENV === "production"
    ? Number(process.env.RETRY_DELAY)
    : 2000;

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

if (!REDIS_DEV_HOST || !REDIS_DEV_PASSWORD || !REDIS_DEV_TCP_PORT) {
  throw new Error(
    "There's an invalid enviroment variable value for redis cloud"
  );
}

if (!BASE_URL) {
  throw new Error("invalid environment variable value for base url");
}

if (!RETRY_ATTEMPTS) {
  throw new Error("Invalid retry attempts settings");
}

if (!RETRY_DELAY) {
  throw new Error("Invalid retry attempts delay settings");
}

export const REDIS_DEV_CONFIG = {
  port: REDIS_DEV_TCP_PORT,
  host: REDIS_DEV_HOST,
  username: "default",
  password: REDIS_DEV_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true
};

export const JOB_OPTIONS = {
  removeOnComplete: false,
  removeOnFail: { age: 24 * 3600 } // Keeping failed jobs for up to 24 hours
};

export default {
  MONGODB_URI,
  PORT,
  ADMIN_EMAIL,
  SMTP_HOST,
  SMTP_PORT,
  MAILTRAP_PASSWORD,
  MAILTRAP_USERNAME,
  BASE_URL,
  RETRY_ATTEMPTS,
  RETRY_DELAY
};
