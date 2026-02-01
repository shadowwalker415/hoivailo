import { Request } from "express";

export type EmailType = "confirmation" | "cancellation";

export type Recipient = "user" | "admin";

export enum AppointmentServices {
  kotiapu = "Kotiapu",
  kotihoito = "Kotihoito",
  kotisiivous = "Kotisiivous",
  yrityssiivous = "Yrityssiivous",
  lastenhoito = "Lastenhoito"
}

export interface IAppointmentCancel {
  appointmentId: string;
  reason: string;
}

export interface IServiceInquiry {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface WorkingHours {
  start: string;
  end: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

export interface CustomRequest extends Request {
  availabilityDate?: string;
}
