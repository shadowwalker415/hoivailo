import {
  AppointmentServices,
  IAppointmentCancel,
  MessagePurpose,
  Role,
  IContact
} from "../types";
import { IAppointment } from "../model/appointment";
import helpers from "./helpers";
import ValidationError from "../errors/validationError";

const isString = (text: unknown): text is string => {
  return typeof text === "string" || text instanceof String;
};

const isDate = (date: string): date is string => {
  return Boolean(Date.parse(date));
};

const isService = (service: string): service is AppointmentServices => {
  return Object.values(AppointmentServices)
    .map((v) => v.toString())
    .includes(service);
};

// Checking if ID is of format 491f16df-2c47-41c6-8b96-8eb4e54be91f for example
const isValidID = (id: string): boolean => {
  return /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(id);
};

const isValidText = (text: string): boolean => {
  return /^(?!.*<.*?>)[^<>]{1,2000}$/.test(text);
};

// Checking if phone number is a valid Finnish phone number for example +358408229831 or +358509310044
const isValidPhone = (phone: string): boolean => {
  return /^\+358(4\d|5\d)\d{6,7}$|^\+358[- ]?(4\d|5\d)[- ]?\d{3}[- ]?\d{4}$/.test(
    phone
  );
};

const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

// Checking if the date of the appointment start or end time is the current date.
const isNotCurrentDate = (date: Date): boolean => {
  return helpers.getDateOfficial(date) !== helpers.getCurrentDate();
};

export const isMessagePurpose = (
  purpose: unknown
): purpose is MessagePurpose => {
  return purpose === "confirmation" || purpose === "cancellation";
};

export const isRole = (role: unknown): role is Role => {
  return role === "user" || role == "admin";
};

const parseAppointmentID = (id: unknown): string => {
  if (!isString(id) || !isValidID(id)) {
    throw new ValidationError({
      message: "Invalid Appointment ID",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return id;
};

const parseText = (text: unknown): string => {
  if (!isString(text) || !isValidText(text)) {
    throw new ValidationError({
      message:
        "Text field must be a valid string and 2000 characters long at most",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return text;
};

const parseTime = (time: unknown): Date => {
  // Checking if appointment date time is a valid ISO 8601 date time string.
  if (!time || !isString(time) || !isDate(time)) {
    throw new ValidationError({
      message: "Start and End time must be a valid ISO 8601 date time string",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }

  // Checking if appointment date time is same as current date.
  if (!isNotCurrentDate(new Date(time)))
    throw new ValidationError({
      message: "An Appointment can't be booked on the same day",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });

  // Checking if appointment date time is a previous date.
  if (helpers.isPastDate(time))
    throw new ValidationError({
      message: "Appointment start or end time cannot be a past date",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });

  // Checking if appointment date time is more than 3 months away.
  if (helpers.getDifferenceInMonths(new Date(time)) > 3)
    throw new ValidationError({
      message:
        "Appointment start or end time cannot be a date more than 3 months away",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });

  // Checking if appointment start or end time is before the official opening hour.
  if (helpers.isBeforeOpeningHour(time)) {
    throw new ValidationError({
      message:
        "Appointment start or end time cannot be a time before official opening hours",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  // Checking if appointment start or end time is after the official closing hour.
  if (helpers.isAfterClosingHour(time)) {
    throw new ValidationError({
      message:
        "Appointment start or end time cannot be a time after official closing hours",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return new Date(time);
};

const parseName = (name: unknown): string => {
  if (!name || !isString(name)) {
    throw new ValidationError({
      message: "Invalid name string",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return name;
};

const parseEmail = (email: unknown): string => {
  if (!email || !isString(email) || !isValidEmail(email)) {
    throw new ValidationError({
      message: "Invalid email address",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return email;
};

const parsePhoneNumber = (phoneNumber: unknown) => {
  if (!phoneNumber || !isString(phoneNumber) || !isValidPhone(phoneNumber)) {
    throw new ValidationError({
      message: "Invalid phone number",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return phoneNumber;
};

export const parseService = (service_type: unknown): string => {
  if (!service_type || !isString(service_type) || !isService(service_type)) {
    throw new ValidationError({
      message:
        "Service must be, either Yrityssiivous, Kotisiivous, Kotihoito, Kotiapu, Lastenhoito",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  return service_type;
};

export const validateAppointmentRequestBody = (
  requestBody: unknown
): IAppointment => {
  if (!requestBody || typeof requestBody !== "object") {
    throw new ValidationError({
      message: "Empty request body",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }

  if (
    "startTime" in requestBody &&
    "endTime" in requestBody &&
    "name" in requestBody &&
    "email" in requestBody &&
    "phone" in requestBody &&
    "service" in requestBody
  ) {
    const newReqBody = {
      startTime: parseTime(requestBody.startTime),
      endTime: parseTime(requestBody.endTime),
      name: parseName(requestBody.name),
      email: parseEmail(requestBody.email),
      phone: parsePhoneNumber(requestBody.phone),
      service: parseService(requestBody.service)
    };
    // Checking if appointment duration is less than or more than 2 hours.
    if (
      helpers.getDifference(newReqBody.startTime, newReqBody.endTime) < 2 ||
      helpers.getDifference(newReqBody.startTime, newReqBody.endTime) > 2
    ) {
      throw new ValidationError({
        message:
          "Appointment duration cannot be less than or more than 2 hours",
        statusCode: 400,
        code: "VALIDATION_ERROR"
      });
    }
    // Checking if appointment start and end time are the same hour.
    if (
      helpers.isEven(newReqBody.startTime) ||
      helpers.isEven(newReqBody.endTime)
    ) {
      throw new ValidationError({
        message: "Appointment start and end time cannot be the same hour",
        statusCode: 400,
        code: "VALIDATION_ERROR"
      });
    }
    // Checking if appointment start or end time has any minute
    if (
      !helpers.isZeroMinutes(newReqBody.startTime) ||
      !helpers.isZeroMinutes(newReqBody.endTime)
    ) {
      throw new ValidationError({
        message: "Appointment start or end time must have 00 minutes",
        statusCode: 400,
        code: "VALIDATION_ERROR"
      });
    }
    return newReqBody as IAppointment;
  }
  throw new ValidationError({
    message: "Missing fields in request body",
    statusCode: 400,
    code: "VALIDATION_ERROR"
  });
};

export const validateAppointmentCancellationBody = (
  body: unknown
): IAppointmentCancel => {
  if (!body || typeof body !== "object") {
    throw new ValidationError({
      message: "Empty request body",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  if ("appointmentId" in body && "reason" in body) {
    const newBody = {
      appointmentId: parseAppointmentID(body.appointmentId),
      reason: parseText(body.reason)
    };
    return newBody;
  }
  throw new ValidationError({
    message: "Request body missing some fields",
    statusCode: 400,
    code: "VALIDATION_ERROR"
  });
};

export const validateContactBody = (contactObj: unknown): IContact => {
  if (!contactObj || typeof contactObj !== "object") {
    throw new ValidationError({
      message: "Empty request body",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  if (
    "name" in contactObj &&
    "phone" in contactObj &&
    "email" in contactObj &&
    "message" in contactObj
  ) {
    const newBody = {
      name: parseName(contactObj.name),
      phone: parsePhoneNumber(contactObj.phone),
      email: parseEmail(contactObj.email),
      message: parseText(contactObj.message)
    };
    return newBody;
  }
  throw new ValidationError({
    message: "Request body missing some fields",
    statusCode: 400,
    code: "VALIDATION_ERROR"
  });
};
