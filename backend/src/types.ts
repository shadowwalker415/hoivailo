import { Request } from "express";
import { Document } from "mongoose";

export type AppointmentStatus = "confirmed" | "cancelled";

export enum AppointmentServices {
  kotiapu = "kotiapu",
  kotihoito = "kotihoito",
  kotisiivous = "kotisiivous",
  yrityssiivous = "yrityssiivous",
  lastenhoito = "lastenhoito"
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

export interface CustomRequest extends Request {
  availabilityDate?: string;
  availableSlots?: string[];
  exisitingAppointments?: IAppointment[];
}
