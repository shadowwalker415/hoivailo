import { Response, IRouter, Router } from "express";
import { CustomRequest } from "../types";
import {
  getAppointDate,
  generateAvailableSlots,
  getExistingAppointments
} from "../middleware/availability";

const availabilityRouter: IRouter = Router();

availabilityRouter.get(
  "/",
  getAppointDate,
  getExistingAppointments,
  generateAvailableSlots,
  async (req: CustomRequest, res: Response) => {
    res.status(200).json({ appoinents: req.exisitingAppointments });
  }
);

export default availabilityRouter;
