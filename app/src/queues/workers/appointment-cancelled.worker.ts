import { Job } from "bullmq";
import { sendAppointmentCancelledEmail } from "../../services/emails";
import { IAppointment, ICancelledAppointment } from "../../model/appointment";
import { processAppointmentEmails, IProcessingData } from "./utils";
import { Recipient } from "../../types";

export const appointmentCancelledWorker = async (
  job: Job<ICancelledAppointment>
) => {
  const data: IProcessingData = {
    emailData: job.data,
    appointmentId: job.data.appointmentId as string,
    appointmentStatus: "cancelled",
    recipient: "user",
    sendEmail: async (
      data: ICancelledAppointment | IAppointment,
      recipient: Recipient,
      reason?: string | undefined
    ) =>
      sendAppointmentCancelledEmail(
        data as ICancelledAppointment,
        recipient,
        reason as string
      )
  };
  // Sending  cancelled appointment email notification for user.
  await processAppointmentEmails(data);

  // sending cancelled appointment email notification for admin.
  await processAppointmentEmails({ ...data, recipient: "admin" });
};
