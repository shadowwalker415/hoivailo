import { Document, Schema, model } from "mongoose";
import { Recipient } from "../types";
// This means even fields that were sent but were not defined in our schema will be stored in the db.
// setting strictQuery to true means only fields specified in the schema will be stored in the db.
// mongoose.set("strictQuery", false);

type EmailStatus = "pending" | "sending" | "sent" | "failed";
type AppointmentSatus = "booked" | "cancelled";

export interface IAppointmentEmail extends Document {
  appointmentId: string;
  status: EmailStatus;
  recipient: Recipient;
  appointmentStatus: AppointmentSatus;
}

const appointmentEmailSchema: Schema = new Schema<IAppointmentEmail>({
  appointmentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "sending", "sent", "failed"],
    default: "pending",
    index: true
  },
  recipient: {
    type: String,
    enum: ["user", "admin"],
    required: true
  },
  appointmentStatus: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked",
    required: true,
    index: true
  }
});

// Setting index for fast reads.
appointmentEmailSchema.index({
  appointmentId: 1,
  recipient: 1,
  appointmentStatus: 1
});

export const AppointmentEmail = model<IAppointmentEmail>(
  "AppointmentEmail",
  appointmentEmailSchema
);
