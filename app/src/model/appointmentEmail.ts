import { Schema, model } from "mongoose";

// This means even fields that were sent but were not defined in our schema will be stored in the db.
// setting strictQuery to true means only fields specified in the schema will be stored in the db.
// mongoose.set("strictQuery", false);

export type Recipient = "user" | "admin";
export type EmailStatus = "pending" | "sending" | "sent" | "failed";
export type AppointmentSatus = "booked" | "cancelled";

const appointmentEmailSchema: Schema = new Schema(
  {
    appointmentId: {
      type: Schema.Types.ObjectId,
      require: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "sending"],
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
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// Setting index for fast reads. Where unique, prevents duplicates.
appointmentEmailSchema.index(
  { appintmentId: 1, recipient: 1, appointmentStatus: 1 },
  { unique: true }
);

export const AppointmentEmail = model(
  "AppointmentEmail",
  appointmentEmailSchema
);
