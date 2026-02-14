import { Schema, Document, model } from "mongoose";

import { v4 as uuidv4 } from "uuid";

export interface IAppointment extends Document {
  appointmentDate?: string; // Important for finding booked appointment for a specific date.
  startTime: Date;
  endTime: Date;
  appointmentId?: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  notes?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  toJSON(): IAppointment;
}

// Doesn't extend IAppointment because IAppointment extends Document.
export interface ICancelledAppointment {
  startTime: Date;
  appointmentId: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  reason: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    appointmentDate: {
      type: String,
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      unique: true
    },
    endTime: {
      type: Date,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      minlength: [3, "Name must be a least 3 characters long"]
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: {
        validator: function (v: IAppointment["email"]) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        }
      },
      trim: true
    },
    phone: {
      type: String
    },
    service: {
      type: String,
      required: true,
      enum: [
        "Kotiapu",
        "Kotihoito",
        "Lastenhoito",
        "Kotisiivous",
        "Yrityssiivous"
      ]
    },
    notes: {
      type: String,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
      required: true
    },
    appointmentId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4()
    }
  },
  {
    timestamps: true
  }
);

appointmentSchema.set("toJSON", {
  transform: function (_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Appointment = model<IAppointment>(
  "Appointment",
  appointmentSchema
);
