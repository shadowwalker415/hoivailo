import { Response, NextFunction } from "express";
import { CustomRequest } from "../types";
import dateHelper from "../utils/dateHelper";

export const getAppointDate = async (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Checking if type of the request date query is a string
    if (typeof req.query.date !== "string")
      throw new Error("Request query date must be a date-time string");
    const dateParam = req.query.date;
    // Checking if date is a valid date string
    if (!dateParam || !dateHelper.isValidDate(dateParam)) {
      throw new Error("Invalid date format!");
    }
    // Setting the date query to the request availabilityDate property
    req.availabilityDate = dateParam;
    next();
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    next(error);
  }
};
