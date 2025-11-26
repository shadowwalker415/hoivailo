import { Queue } from "bullmq";
import { IAppointment, ICancelledAppointment } from "../model/appointment";
import { IContact } from "../types";

export const addJobsToQueue = async (
  queue: Queue,
  jobName: string,
  payLoad: IAppointment | IContact | ICancelledAppointment
) => {
  await queue.add(jobName, payLoad, {
    removeOnComplete: true,
    removeOnFail: { age: 24 * 3600 } // Keeping failed jobs for up to 24 hours
  });
};
