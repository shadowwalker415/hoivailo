import { Response, IRouter, Router } from "express";
import { CustomRequest } from "../types";
import {
  getAppointDate,
  generateAvailableSlots
} from "../middleware/availability";

const availabilityRouter: IRouter = Router();

availabilityRouter.get(
  "/",
  getAppointDate,
  generateAvailableSlots,
  async (req: CustomRequest, res: Response) => {
    res.status(200).json({ slots: req.availableSlots });
  }
);

export default availabilityRouter;
