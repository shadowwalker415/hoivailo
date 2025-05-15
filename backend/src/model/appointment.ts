import mongoose, { Schema, model, Document } from "mongoose";

import { v4 as uuidv4 } from "uuid";

mongoose.set("strictQuery", false);

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

const appointmentSchema: Schema<IAppointment> = new Schema(
  {
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
    emailSent: {
      type: Boolean,
      default: false
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
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
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

export default model<IAppointment>("Appointment", appointmentSchema);
