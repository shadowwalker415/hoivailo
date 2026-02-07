import { Job } from "bullmq";

import { IProcessingData, processAppointmentEmails } from "./utils";
import { sendAppointmentBookedEmail } from "../../services/emails";

import { ICancelledAppointment, IAppointment } from "../../model/appointment";
import { Recipient } from "../../types";

export const appointmentBookedWorker = async (job: Job<IAppointment>) => {
  const data: IProcessingData = {
    emailData: job.data,
    appointmentId: job.data.appointmentId as string,
    appointmentStatus: "booked",
    recipient: "user",
    sendEmail: async (
      data: ICancelledAppointment | IAppointment,
      recipient: Recipient
    ) => sendAppointmentBookedEmail(data as IAppointment, recipient)
  };
  // Sending booked appointment email notification to user.
  await processAppointmentEmails(data);
  // Sending booked appointment email notification to admin.
  await processAppointmentEmails({ ...data, recipient: "admin" });
};
