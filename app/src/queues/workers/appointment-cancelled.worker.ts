import { Job } from "bullmq";
import { sendAppointmentCancelledEmail } from "../../services/emails";
import { IAppointment, ICancelledAppointment } from "../../model/appointment";
import { processAppointmentEmails, IProcessingData } from "./utils";
import { Recipient } from "../../types";
import { instanceOfIAppointment } from "../../utils/parsers";

export const appointmentCancelledWorker = async (
  job: Job<ICancelledAppointment>
) => {
  const data: IProcessingData = {
    emailData: job.data,
    appointmentId: job.data.appointmentId,
    appointmentStatus: "cancelled",
    recipient: "user",
    sendEmail: async (
      data: ICancelledAppointment | IAppointment,
      recipient: Recipient
    ) => {
      if (!instanceOfIAppointment(data)) {
        await sendAppointmentCancelledEmail(data, recipient, data.reason);
      }
    }
  };
  // Sending  cancelled appointment email notification for user.
  await processAppointmentEmails(data);

  // sending cancelled appointment email notification for admin.
  await processAppointmentEmails({ ...data, recipient: "admin" });
};
