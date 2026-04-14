import {
  AppointmentServices,
  IAppointmentCancel,
  IServiceInquiry,
  Recipient,
  EmailType
} from "../types";
import { IAppointment } from "../model/appointment";
import {
  isCurrentDate,
  isWorkingDay,
  isPastDate,
  getDifferenceInMonths,
  isBeforeOpeningHour,
  isAfterClosingHour,
  getDifference,
  isEven,
  isZeroMinutes
} from "./helpers";
import ValidationError from "../errors/validationError";

// Used for collecting request body input errors
export interface FieldErrors {
  [key: string]: string;
}

const isString = (text: unknown): text is string => {
  return typeof text === "string" || text instanceof String;
};

export const sanitizeEmailAndId = (input: string): string => {
  // Removing all HTML tags
  return input.replace(/<[^>]*>/g, "");
};

export const sanitizeText = (input: string): string => {
  // Removing HTML and dangerous characters (except safe punctuation)
  const strippedInjectionChars = input
    .replace(/<[^>]*>/g, "")
    .replace(/[${}[\]"'\\;]|--/g, "");
  return strippedInjectionChars;
};

const isDate = (date: string): date is string => {
  // Reqular expression testing if date string is of format yyyy-mm-dd or yyyy-mm-dd hh:mm
  const dateRegex = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/;
  return dateRegex.test(date) && Boolean(Date.parse(date));
};

export const isBookedAppointment = (value: unknown): value is IAppointment => {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    value.status === "booked"
  );
};

export const isIAppointment = (value: unknown): value is IAppointment => {
  return (
    typeof value === "object" &&
    value !== null &&
    "startTime" in value &&
    "endTime" in value
  );
};

export const isIAppoinmentCancel = (
  value: unknown
): value is IAppointmentCancel => {
  return (
    typeof value === "object" && value !== null && "appointmentId" in value
  );
};

export const isIServiceInquiry = (value: unknown): value is IServiceInquiry => {
  return typeof value === "object" && value !== null && "message" in value;
};

const isService = (service: string): service is AppointmentServices => {
  return Object.values(AppointmentServices)
    .map((v) => v.toString())
    .includes(service);
};

const hasErrors = (errors: FieldErrors): boolean => {
  return Object.entries(errors).length > 0;
};

// Checking if phone number is a valid Finnish phone number for example +3584XXXXXXXX or +3585XXXXXXXX
const isValidPhone = (phone: string): boolean => {
  const phoneRegex =
    /^\+358(4\d|5\d)\d{6,7}$|^\+358[- ]?(4\d|5\d)[- ]?\d{3}[- ]?\d{4}$/;
  return phoneRegex.test(phone);
};

const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

function isValidID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id.trim());
}

export const isEmailType = (purpose: unknown): purpose is EmailType => {
  return purpose === "confirmation" || purpose === "cancellation";
};

export const isRecipient = (role: unknown): role is Recipient => {
  return role === "user" || role == "admin";
};

const parseAppointmentID = (
  id: unknown,
  error: FieldErrors
): string | undefined => {
  if (!id) {
    error.id = "Appointment is required.";
    return;
  }
  if (!isString(id)) {
    error.id = "Invalid appointment id.";
    return;
  }

  if (!isValidID(id)) {
    error.id = "Invalid appointment id.";
    return;
  }
  return id;
};

const parseText = (text: unknown, error: FieldErrors): string | undefined => {
  if (!text) {
    error.text = "Text is required";
    return;
  }
  if (!isString(text)) {
    error.text = "Text is invalid";
    return;
  }
  return text;
};

const parseTime = (time: unknown, error: FieldErrors): Date | undefined => {
  if (!time) {
    error.time = "Time is required";
    return;
  }
  // Checking if appointment date time is a valid ISO 8601 date time string.
  if (!isString(time) || !isDate(time)) {
    error.time = "TIme must be a valid ISO 8601 date time string.";
    return;
  }

  // Checking if appointment date time is same as current date.
  if (isCurrentDate(new Date(time))) {
    error.time = "An appointment cannot be booked on the same day.";
    return;
  }
  // Checking if appointment date time is a previous date.
  if (isPastDate(time)) {
    error.time = "Appointment start or end time cannot be a past date.";
    return;
  }

  // Checking if appointment date time is not week day
  if (!isWorkingDay(time)) {
    error.time = "Appointment start time must be on a week day.";
    return;
  }

  // Checking if appointment date time is pver 3 months.
  if (getDifferenceInMonths(new Date(time)) >= 3) {
    error.time = "Appointment date time cannot be over 3 months.";
    return;
  }

  // Checking if appointment start or end time is before the official opening hour.
  if (isBeforeOpeningHour(time)) {
    error.time = "Appointment start or end time cannot be before opening hours";
    return;
  }

  // Checking if appointment start or end time is after the official closing hour.
  if (isAfterClosingHour(time)) {
    error.time = "Appointment start or end time cannot be after closing hours.";
    return;
  }
  return new Date(time);
};

const parseName = (name: unknown, error: FieldErrors): string | undefined => {
  if (!name || !isString(name)) {
    error.name = "Name is required";
    return;
  }
  return name;
};

const parseEmail = (email: unknown, error: FieldErrors): string | undefined => {
  if (!email) {
    error.email = "Email is required";
    return;
  }
  if (!isString(email) || !isValidEmail(email)) {
    error.email = "Invalid email";
    return;
  }
  return email;
};

const parsePhoneNumber = (
  phoneNumber: unknown,
  error: FieldErrors
): string | undefined => {
  if (!phoneNumber) {
    error.phone = "Phone number is required";
    return;
  }
  if (!isString(phoneNumber) || !isValidPhone(phoneNumber)) {
    error.phone = "Invalid phone number.";
    return;
  }
  return phoneNumber;
};

export const parseService = (
  service: unknown,
  error: FieldErrors
): string | undefined => {
  if (!service) {
    error.service = "Service is required.";
    return;
  }
  if (!isString(service) || !isService(service)) {
    error.service = "Invalid service.";
    return;
  }
  return service;
};

export const validateAppointmentRequestBody = (
  requestBody: unknown
): IAppointment | FieldErrors => {
  const errors: FieldErrors = {};
  if (!requestBody || typeof requestBody !== "object") {
    throw new ValidationError({
      message: "Empty request body",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }

  const body = requestBody as Record<string, unknown>;

  const newReqBody = {
    startTime: parseTime(body.startTime, errors),
    endTime: parseTime(body.endTime, errors),
    name: parseName(body.name, errors),
    email: parseEmail(body.email, errors),
    phone: parsePhoneNumber(body.phone, errors),
    service: parseService(body.service, errors)
  };

  if (newReqBody.startTime && newReqBody.endTime) {
    const duration = getDifference(newReqBody.startTime, newReqBody.endTime);

    // Checking if appointment duration is less than or more than 2 hours.
    if (duration !== 2) {
      errors.time = "Appointment time must be 2 hours.";
    }

    // Checking if appointment start and end time are the same hour.
    if (isEven(newReqBody.startTime) || isEven(newReqBody.endTime)) {
      errors.time =
        "Appointment start time and end time cannot have the same hour.";
    }
    // Checking if appointment start or end time has any minute
    if (
      !isZeroMinutes(newReqBody.startTime) ||
      !isZeroMinutes(newReqBody.endTime)
    ) {
      errors.time =
        "Appointment start time or end time cannot have more than zero minute.";
    }
  }
  if (hasErrors(errors)) {
    return { ...errors };
  }

  return { ...newReqBody } as IAppointment;
};

export const validateAppointmentCancellationBody = (
  requestBody: unknown
): IAppointmentCancel | FieldErrors => {
  const errors: FieldErrors = {};
  if (!requestBody || typeof requestBody !== "object") {
    throw new ValidationError({
      message: "Empty request body",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }
  const body = requestBody as Record<string, unknown>;

  const newBody = {
    appointmentId: parseAppointmentID(body.appointmentId, errors),
    reason: parseText(body.reason, errors)
  };

  if (hasErrors(errors)) {
    return { ...errors };
  }

  return { ...newBody } as IAppointmentCancel;
};

export const validateServiceInquiryBody = (
  contactObj: unknown
): IServiceInquiry | FieldErrors => {
  const errors: FieldErrors = {};
  if (!contactObj || typeof contactObj !== "object") {
    throw new ValidationError({
      message: "Empty request body",
      statusCode: 400,
      code: "VALIDATION_ERROR"
    });
  }

  const TempBody = contactObj as Record<string, unknown>;

  const newBody = {
    name: parseName(TempBody.name, errors),
    phone: parsePhoneNumber(TempBody.phone, errors),
    email: parseEmail(TempBody.email, errors),
    message: parseText(TempBody.message, errors)
  };

  if (hasErrors(errors)) {
    return { ...errors };
  }

  return { ...newBody } as IServiceInquiry;
};
