import {
  AppointmentServices,
  IAppointmentCancel,
  MessagePurpose,
  Role,
  IContact
} from "../types";
import { IAppointment } from "../model/appointment";
import dateHelper from "./dateHelper";

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
  return dateHelper.getDateOfficial(date) !== dateHelper.getCurrentDate();
};

const parseAppointmentID = (id: unknown): string => {
  if (!isString(id) || !isValidID(id)) {
    throw new Error("Appointment id must be a valid appointment Id");
  }
  return id;
};

const parseText = (text: unknown): string => {
  if (!isString(text) || !isValidText(text)) {
    throw new Error("Message or reason must be a valid string");
  }
  return text;
};

const parseTime = (time: unknown): Date => {
  if (!time || !isString(time) || !isDate(time)) {
    throw new Error(
      "Start and End time must be a valid ISO 18601 date time string"
    );
  }

  if (!isNotCurrentDate(new Date(time)))
    throw new Error("An Appointment can't be booked on the same day");

  if (dateHelper.isPastDate(time))
    throw new Error("Appointment start or end time cannot be a past date");

  if (dateHelper.getDifferenceInMonths(new Date(time)) > 3)
    throw new Error(
      "Appointment start or end time cannot be a date more than 3 months away"
    );
  if (dateHelper.isBeforeOpeningHour(time)) {
    throw new Error(
      "Appointment start or end time cannot be a time before official opening hours"
    );
  }
  if (dateHelper.isAfterClosingHour(time)) {
    throw new Error(
      "Appointment start or end time cannot be a time after official closing hours"
    );
  }
  return new Date(time);
};

const parseName = (name: unknown): string => {
  if (!name || !isString(name)) {
    throw new Error("Name must be a valid name");
  }
  return name;
};

const parseEmail = (email: unknown): string => {
  if (!email || !isString(email) || !isValidEmail(email)) {
    throw new Error("Email must be a valid Email address");
  }
  return email;
};

const parsePhoneNumber = (phoneNumber: unknown) => {
  if (!phoneNumber || !isString(phoneNumber) || !isValidPhone(phoneNumber)) {
    throw new Error("Phone number must be a valid phone number");
  }
  return phoneNumber;
};

export const parseService = (service_type: unknown): string => {
  if (!service_type || !isString(service_type) || !isService(service_type)) {
    throw new Error(
      "Service must be, either Yrityssiivous, Kotisiivous, Kotihoito, Kotiapu, Lastenhoito"
    );
  }
  return service_type;
};

export const isMessagePurpose = (
  purpose: unknown
): purpose is MessagePurpose => {
  return purpose === "confirmation" || purpose === "cancellation";
};

export const isRole = (role: unknown): role is Role => {
  return role === "user" || role == "admin";
};

export const validateAppointmentRequestBody = (
  requestBody: unknown
): IAppointment => {
  if (!requestBody || typeof requestBody !== "object") {
    throw new Error("Request body cannot be empty");
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
    if (
      dateHelper.getDifference(newReqBody.startTime, newReqBody.endTime) < 2 ||
      dateHelper.getDifference(newReqBody.startTime, newReqBody.endTime) > 2
    ) {
      throw new Error(
        "The duration of an appointment cannot be less than an hour or exceed 2 hours"
      );
    }
    if (
      dateHelper.isEven(newReqBody.startTime) ||
      dateHelper.isEven(newReqBody.endTime)
    ) {
      throw new Error(
        "Appointment start or end time cannot be an even hour based on the official opening hours"
      );
    }
    if (
      !dateHelper.isZeroMinutes(newReqBody.startTime) ||
      !dateHelper.isZeroMinutes(newReqBody.endTime)
    ) {
      throw new Error("Appointment start or end time must have 00 minutes");
    }
    return newReqBody as IAppointment;
  }
  throw new Error("Request body missing some fields");
};

export const validateAppointmentCancellationBody = (
  body: unknown
): IAppointmentCancel => {
  if (!body || typeof body !== "object") {
    throw new Error("Request body cannot be empty");
  }
  if ("appointmentId" in body && "reason" in body) {
    const newBody = {
      appointmentId: parseAppointmentID(body.appointmentId),
      reason: parseText(body.reason)
    };
    return newBody;
  }
  throw new Error("Request body missing some fields");
};

export const validateContactBody = (contactObj: unknown): IContact => {
  if (!contactObj || typeof contactObj !== "object") {
    throw new Error("Request body cannot be empty");
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
  throw new Error("Request body missing some fields");
};
