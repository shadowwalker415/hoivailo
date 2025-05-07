import { Request } from "express";
import { Document } from "mongoose";

// export type AppointmentStatus = "confirmed" | "cancelled";

export type MessagePurpose = "confirmation" | "cancellation";

export type Role = "user" | "admin";

export enum AppointmentServices {
  kotiapu = "kotiapu",
  kotihoito = "kotihoito",
  kotisiivous = "kotisiivous",
  yrityssiivous = "yrityssiivous",
  lastenhoito = "lastenhoito"
}

export interface IAppointmentCancel {
  appointmentId: string;
  reason: string;
}

export interface IAppointment extends Document {
  startTime: Date;
  endTime: Date;
  appointmentId?: string;
  name: string;
  email: string;
  emailSent?: boolean;
  phone: string;
  service: string;
  notes?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  toJSON(): IAppointment;
}

export interface WorkingHours {
  start: string;
  end: string;
}

export interface Slot {
  start: Date;
  end: Date;
}

export interface CustomRequest extends Request {
  availabilityDate?: string;
}
