import { Queue } from "bullmq";
import { IAppointment } from "../model/appointment";
import { IContact } from "../types";

export const addJobsToQueue = async (
  queue: Queue,
  jobName: string,
  payLoad: IAppointment | IContact
) => {
  await queue.add(jobName, payLoad);
  console.log("%s added to queue", jobName);
};
