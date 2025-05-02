import { Response, IRouter, Router } from "express";
import { CustomRequest, Slot } from "../types";
import { getAppointDate } from "../middleware/availability";
import dateHelper from "../utils/dateHelper";
import appointmentService from "../services/appointmentService";

const availabilityRouter: IRouter = Router();

availabilityRouter.get(
  "/",
  getAppointDate,
  async (req: CustomRequest, res: Response) => {
    try {
      // checking if requested date is a previous date.
      if (dateHelper.isPastDate(req.availabilityDate as string)) {
        res.status(200).json({ slots: [] });
        // checking if requested date is a working day
      } else if (!dateHelper.isWorkingDay(req.availabilityDate as string)) {
        res.status(200).json({ slots: [] });
      } else {
        const availableSlots = await appointmentService.generateAvailableSlots(
          req.availabilityDate as string
        );
        if (!availableSlots) throw new Error("Something went really wrong");
        res.status(200).json({ slots: availableSlots as Slot[] });
      }
    } catch (_err: unknown) {
      res.status(400).json({ error: "Something went really wrong" });
    }
  }
);

export default availabilityRouter;
