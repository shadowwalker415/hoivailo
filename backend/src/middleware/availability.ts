import { Response, NextFunction } from "express";
import { CustomRequest } from "../types";
import dateHelper from "../utils/dateHelper";

export const getAppointDate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // converting data type of the request requery date to a string type
    const dateParam = req.query.date as string;
    // Checking if date is a valid date string
    if (!dateParam || !dateHelper.isValidDate(dateParam)) {
      throw new Error("Invalid date format!");
    }
    // Setting the date query to the request availabilityDate property
    req.availabilityDate = dateParam;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid date format" });
  }
};
