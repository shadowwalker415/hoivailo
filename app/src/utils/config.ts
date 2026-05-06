import dotenv from "dotenv";
import logger from "./logger";
dotenv.config();

function requireENV(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    logger.error(`Missing required environment variable: ${name}`);
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requireNumberENV(name: string): number {
  const value = process.env[name];
  const parsedValue = Number(value);

  if (isNaN(parsedValue)) {
    logger.warn(`Invalid number for environment variable: ${name}`);
    throw new Error(`Invalid number for environment variable: ${name}`);
  }

  return parsedValue;
}

function optionalENV(name: string, defaultValue: string): string {
  const value = process.env[name];

  if (!value) {
    logger.warn(
      `Environment variable ${name} not set. Using default: ${defaultValue}`
    );
    // This is only for development purposes. Where we have a dev env file.
    if (!process.env[defaultValue]) {
      return defaultValue;
    }
    return process.env[defaultValue];
  }
  return value;
}

export const REDIS_CONFIG = {
  port:
    process.env.NODE_ENV === "production"
      ? requireNumberENV("REDIS_PORT")
      : requireNumberENV("REDIS_DEV_PORT"),
  host:
    process.env.NODE_ENV === "production"
      ? requireENV("REDIS_HOST")
      : requireENV("REDIS_DEV_HOST"),
  username: "default",
  password:
    process.env.NODE_ENV === "production"
      ? requireENV("REDIS_PASSWORD")
      : optionalENV("REDIS_PASSWORD", "REDIS_DEV_PASSWORD"),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true
};

export const QUEUE_JOB_OPTIONS = {
  removeOnComplete: false,
  removeOnFail: { age: 24 * 3600 } // Keeping failed jobs for up to 24 hours
};

export default {
  MONGODB_URI:
    process.env.NODE_ENV === "production"
      ? requireENV("MONGODB_URI")
      : optionalENV("MONGODB_URI", "MONGODB_DEV_URI"),
  PORT: parseInt(optionalENV("PORT", "3001"), 10),
  ADMIN_EMAIL: optionalENV("ADMIN_EMAIL", "exampleadmin@gmail.com"),
  SMTP_HOST: optionalENV("SMTP_HOST", "SMTP_DEV_HOST"),
  SMTP_PORT:
    process.env.NODE_ENV === "production"
      ? requireNumberENV("SMTP_PORT")
      : requireNumberENV("SMTP_DEV_PORT"),
  SMTP_PASSWORD:
    process.env.NODE_ENV === "production"
      ? requireENV("SENDGRID_PASSWORD")
      : optionalENV("SENDGRID_PASSWORD", "MAILTRAP_PASSWORD"),
  SMTP_USERNAME:
    process.env.NODE_ENV === "production"
      ? requireENV("SENDGRID_USERNAME")
      : optionalENV("SENDGRID_USERNAME", "MAILTRAP_USERNAME"),
  BASE_URL: optionalENV("BASE_URL", "BASE_DEV_URL"),
  RETRY_ATTEMPTS: parseInt(optionalENV("RETRY_ATTEMPTS", "3"), 10),
  RETRY_DELAY: parseInt(optionalENV("RETRY_DELAY", "2000"))
};
