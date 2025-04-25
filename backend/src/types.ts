import { Document } from "mongoose";
import { Request } from "express";

export type AppointmentStatus = "confirmed" | "cancelled";

export interface IAppointmentDate {
  date: Date;
}

export type AppointmentServices =
  | "kotiapu"
  | "kotihoito"
  | "lastenhoito"
  | "kotisiivous"
  | "yrityssiivous";

export interface IAppointmentJSON {
  id: string;
  startTime: Date;
  endTime: Date;
  appointmentId: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  phone?: string;
  service: AppointmentServices;
  notes?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointment extends Document {
  startTime: Date;
  endTime: Date;
  appointmentId: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  phone?: string;
  service: AppointmentServices;
  notes?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): IAppointmentJSON;
}

export interface CustomRequest extends Request {
  availabilityDate?: string;
}
