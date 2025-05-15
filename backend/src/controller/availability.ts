import { Response, IRouter, Router, NextFunction } from "express";
import { CustomRequest } from "../types";
import { getAppointDate } from "../middleware/availability";
import dateHelper from "../utils/dateHelper";
import appointmentService from "../services/appointmentService";

const availabilityRouter: IRouter = Router();

availabilityRouter.get(
  "/",
  getAppointDate,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // checking if requested date is a previous date.
      if (dateHelper.isPastDate(req.availabilityDate as string)) {
        res.status(200).json({ slots: [] });
        // checking if requested date is a working day.
      } else if (!dateHelper.isWorkingDay(req.availabilityDate as string)) {
        res.status(200).json({ slots: [] });
        // Checking if requested date is the current date.
      } else if (
        dateHelper.getCurrentDate() ===
        dateHelper.getDateOfficial(new Date(req.availabilityDate as string))
      ) {
        res.status(200).json({ slots: [] });
      } else {
        const availableSlots = await appointmentService.generateAvailableSlots(
          req.availabilityDate as string
        );
        // Checking if the slot generation operation failed due to
        // maybe an error with database query
        if (availableSlots instanceof Error)
          throw new Error("Something went really wrong");
        res.status(200).json({ slots: availableSlots });
      }
    } catch (err: unknown) {
      let error = undefined;
      if (err instanceof Error) {
        error = err;
        next(error);
      } else {
        next(new Error("unknown error"));
      }
    }
  }
);

export default availabilityRouter;
