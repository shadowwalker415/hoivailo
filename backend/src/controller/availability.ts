import { Response, IRouter, Router, NextFunction } from "express";
import { CustomRequest } from "../types";
import { getAppointDate } from "../middleware/availability";
import dateHelper from "../utils/helpers";
import appointmentService from "../services/appointmentService";
import CustomError from "../errors/customError";
import InternalServerError from "../errors/internalServerError";
import ValidationError from "../errors/validationError";

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
        if (availableSlots instanceof Error) {
          throw new CustomError({
            message:
              "An error occured on the database: Couldn't generate available slots",
            statusCode: 500
          });
        }
        res
          .status(200)
          .json({ success: true, code: 200, data: { slots: availableSlots } });
      }
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof ValidationError) {
        next(err);
      } else {
        next(
          new InternalServerError({
            message: "An unknown error occurred",
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR"
          })
        );
      }
    }
  }
);

export default availabilityRouter;
