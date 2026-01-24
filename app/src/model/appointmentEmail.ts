import { Document, Schema, model, Types } from "mongoose";
import { Recipient } from "../types";
// This means even fields that were sent but were not defined in our schema will be stored in the db.
// setting strictQuery to true means only fields specified in the schema will be stored in the db.
// mongoose.set("strictQuery", false);

type EmailStatus = "pending" | "sending" | "sent" | "failed";
type AppointmentSatus = "booked" | "cancelled";

export interface IAppointmentEmail extends Document {
  appointmentId: Types.ObjectId;
  status: EmailStatus;
  recipient: Recipient;
  appointmentSatus: AppointmentSatus;
}

const appointmentEmailSchema: Schema = new Schema<IAppointmentEmail>({
  appointmentId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
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
  appointmentSatus: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked",
    required: true,
    index: true
  }
});

// Setting index for fast reads. Where unique, prevents duplicates.
appointmentEmailSchema.index(
  { appintmentId: 1, recipient: 1, appointmentStatus: 1 },
  { unique: true }
);

export const AppointmentEmail = model<IAppointmentEmail>(
  "AppointmentEmail",
  appointmentEmailSchema
);
