import { Schema, model } from "mongoose";

import { v4 as uuidv4 } from "uuid";

export interface IAppointment {
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
      required: [true, "An appointment date is required"],
      index: true
    },
    startTime: {
      type: Date,
      required: [true, "An appointment start time is required"],
      index: true,
      unique: true
    },
    endTime: {
      type: Date,
      required: [true, "An appointment end time is required"],
      unique: true
    },
    name: {
      type: String,
      required: [true, "A name is required for the appointment"],
      minlength: [3, "Name must be a least 3 characters long"],
      maxlength: [40, "Name is too long"]
    },
    email: {
      type: String,
      required: [true, "An email is required for the appointment"],
      lowercase: true,
      validate: {
        validator: function (value: IAppointment["email"]) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        }
      },
      trim: true
    },
    phone: {
      type: String
    },
    service: {
      type: String,
      required: [true, "A service is required for the appointment"],
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
      maxlength: [
        1000,
        "Max number of characters for appointment notes is 1000."
      ]
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
      required: [true, "The appointment status is required"]
    },
    appointmentId: {
      type: String,
      required: [true, "The appointment ID is required"],
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

// Compound index to avoid double booking/race condition.
appointmentSchema.index(
  { appointmentDate: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export const Appointment = model<IAppointment>(
  "Appointment",
  appointmentSchema
);
