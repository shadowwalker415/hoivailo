import { Response, NextFunction } from "express";
import { CustomRequest } from "../types";
import { isValidDate } from "../utils/helpers";
import ValidationError from "../errors/validationError";
import InternalServerError from "../errors/internalServerError";

export const getAppointDate = async (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Checking if there is a request query parameter
    if (!req.query.date) {
      throw new ValidationError({
        message: "Request is missing query date paramter",
        statusCode: 400,
        code: "VALIDATION_ERROR"
      });
    }
    // Checking if type of the request date query is a string
    if (typeof req.query.date !== "string") {
      throw new ValidationError({
        message: "Request query date parameter must be a string",
        statusCode: 400,
        code: "VALIDATION_ERROR"
      });
    }

    // Checking if date is a valid date string
    if (!isValidDate(req.query.date)) {
      throw new ValidationError({
        message: "Invalid date format for request requery date paramter",
        statusCode: 400,
        code: "VALIDATION_ERROR"
      });
    }
    // Setting the date query to the request availabilityDate property
    req.availabilityDate = req.query.date;
    next();
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      next(err);
    } else {
      next(
        new InternalServerError({
          message: "An error occured. Check logs for more info.",
          statusCode: 500,
          code: "INTERNAL_SERVER_ERROR"
        })
      );
    }
  }
};
