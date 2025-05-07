import {
  IAppointment,
  AppointmentServices,
  IAppointmentCancel,
  MessagePurpose,
  Role
} from "../types";

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

const isValidID = (id: string): boolean => {
  return /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/.test(id);
};

const parseAppointmentID = (id: unknown): string => {
  if (!isString(id) || !isValidID(id)) {
    throw new Error("Appointment id string is invalid");
  }
  return id;
};

const isValidText = (text: string): boolean => {
  return /^(?!.*<.*?>)[^<>]{1,500}$/.test(text);
};

const parseReason = (text: unknown): string => {
  if (!isString(text) || !isValidText(text)) {
    throw new Error("Reason text string is invalid");
  }
  return text;
};

const parseTime = (time: unknown): Date => {
  if (!time || !isString(time) || !isDate(time)) {
    throw new Error("Start and End time must be a valid date string");
  }
  return new Date(time);
};

const parseName = (name: unknown): string => {
  if (!name || !isString(name)) {
    throw new Error("Name must be a valid string");
  }
  return name;
};

const parseEmail = (email: unknown): string => {
  if (!email || !isString(email)) {
    throw new Error("Email must be a valid string");
  }
  return email;
};

const parsePhoneNumber = (phoneNumber: unknown) => {
  if (!phoneNumber || !isString(phoneNumber)) {
    throw new Error("Phone number must be a valid string");
  }
  return phoneNumber;
};

export const parseService = (service_type: unknown): string => {
  if (!service_type || !isString(service_type) || !isService(service_type)) {
    throw new Error(
      "Service must be, either yrityssiivous, kotisiivous, kotihoito, kotiapu, lastenhoito"
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

export const validateAppointmentID = (
  requestBody: unknown
): IAppointmentCancel => {
  if (!requestBody || typeof requestBody !== "object") {
    throw new Error("Request body cannot be empty");
  }
  if ("appointmentId" in requestBody && "reason" in requestBody) {
    const newReqBody = {
      appointmentId: parseAppointmentID(requestBody.appointmentId),
      reason: parseReason(requestBody.reason)
    };
    return newReqBody as IAppointmentCancel;
  }
  throw new Error("Request body is missing some fields");
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
      reason: parseReason(body.reason)
    };
    return newBody;
  }
  throw new Error("Request body missing some fields");
};
