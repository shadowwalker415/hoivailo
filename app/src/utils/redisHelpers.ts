import { Queue } from "bullmq";
import { IAppointment, ICancelledAppointment } from "../model/appointment";
import { IContact } from "../types";

export const addJobsToQueue = async (
  queue: Queue,
  jobName: string,
  payLoad: IAppointment | IContact | ICancelledAppointment
) => {
  await queue.add(jobName, payLoad);
  console.log("%s added to queue", jobName);
};
