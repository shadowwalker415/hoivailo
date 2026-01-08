import { Schema, model } from "mongoose";

const contactRequestEmailSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "sending", "sent", "failed"],
      required: true,
      index: true
    },
    sender: {
      type: String,
      required: true,
      index: true,
      unique: true
    }
  },
  { timestamps: true }
);

contactRequestEmailSchema.index({ status: 1, sender: 1 });

export const contactRequestEmail = model(
  "ContactRequestEmail",
  contactRequestEmailSchema
);
