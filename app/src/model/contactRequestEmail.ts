import { Document, Schema, model } from "mongoose";

type EmailStatus = "pending" | "sending" | "sent" | "failed";

export interface IContactRequestEmail extends Document {
  status: EmailStatus;
  senderEmail: string;
}

const contactRequestEmailSchema = new Schema<IContactRequestEmail>({
  status: {
    type: String,
    enum: ["pending", "sending", "sent", "failed"],
    default: "pending",
    required: true,
    index: true
  },
  senderEmail: {
    type: String,
    required: true,
    index: true,
    unique: true
  }
});

contactRequestEmailSchema.index({ status: 1, senderEmail: 1 });

export const contactRequestEmail = model<IContactRequestEmail>(
  "ContactRequestEmail",
  contactRequestEmailSchema
);
