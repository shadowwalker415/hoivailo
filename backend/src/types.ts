import { Request } from "express";

export type AppointmentStatus = "confirmed" | "cancelled";

export enum AppointmentServices {
  kotiapu = "kotiapu",
  kotihoito = "kotihoito",
  kotisiivous = "kotisiivous",
  yrityssiivous = "yrityssiivous",
  lastenhoito = "lastenhoito"
}

export interface IAppointmentJSON {
  _id: string;
  startTime: Date;
  endTime: Date;
  appointmentId: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  phone: string;
  service: AppointmentServices;
  notes?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointment {
  startTime: Date;
  endTime: Date;
  appointmentId?: string;
  name: string;
  email: string;
  emailConfirmed?: boolean;
  phone: string;
  service: string;
  notes?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkingHours {
  start: string;
  end: string;
}

export interface CustomRequest extends Request {
  availabilityDate?: string;
  availableSlots?: string[];
}
