import { IAppointment, AppointmentServices } from "../types";

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

const parseService = (service_type: unknown): string => {
  if (!service_type || !isString(service_type) || !isService(service_type)) {
    throw new Error(
      "Service must be either, yrityssiivous, kotisiivous, kotihoito, kotiapu, lastenhoito"
    );
  }
  return service_type;
};

export const validateRequestBody = (requestBody: unknown): IAppointment => {
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
    return newReqBody;
  }
  throw new Error("Request body missing some fields");
};
