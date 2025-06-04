import { Response, IRouter, Router, NextFunction } from "express";
import { CustomRequest } from "../types";
import { getAppointDate } from "../middleware/availability";
import {
  isPastDate,
  isWorkingDay,
  getCurrentDate,
  getDateOfficial,
  getDifferenceInMonths
} from "../utils/helpers";
import { generateAvailableSlots } from "../services/appointmentService";
import ValidationError from "../errors/validationError";
import InternalServerError from "../errors/internalServerError";

const availabilityRouter: IRouter = Router();

availabilityRouter.get(
  "/",
  getAppointDate,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Checking if the request has a query parameter.
      if (!req.availabilityDate) {
        throw new ValidationError({
          message: "Request is missing query parameter",
          statusCode: 400,
          code: "VALIDATION_ERROR"
        });
      }
      // checking if requested date is a previous date.
      if (isPastDate(req.availabilityDate)) {
        res.status(200).json({
          success: true,
          status: 200,
          data: {
            slot: []
          }
        });
        // checking if requested date is a working day.
      } else if (!isWorkingDay(req.availabilityDate)) {
        res.status(200).json({
          success: true,
          status: 200,
          data: {
            slot: []
          }
        });
        // Checking if requested date is the current date.
      } else if (
        getCurrentDate() === getDateOfficial(new Date(req.availabilityDate))
      ) {
        res.status(200).json({
          success: true,
          status: 200,
          data: {
            slot: []
          }
        });
        // Checking if requested date is more than 3 months away.
      } else if (getDifferenceInMonths(new Date(req.availabilityDate)) >= 3) {
        res.status(200).json({
          success: true,
          status: 200,
          data: {
            slot: []
          }
        });
      } else {
        const availableSlots = await generateAvailableSlots(
          req.availabilityDate
        );
        // Checking if the slot generation operation failed due to
        // maybe an error with database query
        if (availableSlots instanceof Error) {
          throw new InternalServerError({
            message:
              "An error occured on the database: Couldn't generate available slots",
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR"
          });
        }
        res
          .status(200)
          .json({ success: true, code: 200, data: { slots: availableSlots } });
      }
    } catch (err: unknown) {
      if (
        err instanceof Error ||
        err instanceof ValidationError ||
        err instanceof InternalServerError
      ) {
        next(err);
      } else {
        next(new Error("An unknown error occured"));
      }
    }
  }
);

export default availabilityRouter;
