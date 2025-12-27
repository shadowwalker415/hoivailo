import mongoose, { Schema } from "mongoose";

mongoose.set("strictQuery", false);

const emailSchema: Schema = new mongoose.Schema(
  {
    deDupeKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      enum: ["pending, sent", "fail"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Email", emailSchema);
