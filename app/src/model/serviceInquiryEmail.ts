import { Document, Schema, model } from "mongoose";

type EmailStatus = "pending" | "sending" | "sent" | "failed";

export interface IServiceInquiryEmail extends Document {
  status: EmailStatus;
  senderEmail: string;
}

const serviceInquiryEmailSchema = new Schema<IServiceInquiryEmail>({
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
    index: true
  }
});

serviceInquiryEmailSchema.index(
  { status: 1, senderEmail: 1 },
  { unique: true }
);

export const serviceInquiryEmail = model<IServiceInquiryEmail>(
  "ServiceInquiryEMail",
  serviceInquiryEmailSchema
);
