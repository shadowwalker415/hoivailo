import { Response, NextFunction } from "express";
import { CustomRequest, WorkingHours } from "../types";
import dateHelper from "../utils/dateHelper";
import { parse, isBefore, format, addMinutes } from "date-fns";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";

export const getAppointDate = async (
  request: CustomRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    // converting data type of the request requery date to a string type
    const dateParam = request.query.date as string;
    // Checking if date is a valid date string
    if (!dateParam || !dateHelper.isValidDate(dateParam)) {
      throw new Error("Invalid date format!");
    }
    // Setting the date query to the request availabilityDate property
    request.availabilityDate = dateParam;
    next();
  } catch (err) {
    response.status(401).json({ error: "Invalid date format" });
  }
};

// Slot generation helper function
const generateSlots = (
  date_string: string,
  workHours: WorkingHours,
  durationMinutes: number
): string[] => {
  const startTime = parse(
    `${date_string} ${workHours.start}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  const endTime = parse(
    `${date_string} ${workHours.end}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  const slots: string[] = [];
  let current = startTime;

  while (
    isBefore(addMinutes(current, durationMinutes), addMinutes(endTime, 1))
  ) {
    const slotStart = format(current, "HH:mm");
    const slotEnd = format(addMinutes(current, durationMinutes), "HH:mm");
    slots.push(`${slotStart} - ${slotEnd}`);

    current = addMinutes(current, durationMinutes);
  }
  return slots;
};

export const generateAvailableSlots = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // checking if requested date is a previous date.
    if (dateHelper.isPastDate(req.availabilityDate as string)) {
      req.availableSlots = [];
      // checking if requested date is a working day
    } else if (!dateHelper.isWorkingDay(req.availabilityDate as string)) {
      req.availableSlots = [];
    } else {
      const slots = generateSlots(
        req.availabilityDate as string,
        WORKING_HOURS,
        SLOT_DURATION_MINUTES
      );
      req.availableSlots = slots;
    }
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid date" });
  }
};
