import { format, compareAsc, parse, differenceInMonths } from "date-fns";
import { WORKING_DAYS, HOLIDAY_DATES } from "./availability.config";
import config from "./config";

export const isValidDate = (dateString: string): boolean => {
  // Regular expression for valid date string where date string format is yyyy-MM-dd
  const regex =
    /^(?:(?:(?:[0-9]{4}-(?:0[13578]|1[02])-(?:0[1-9]|[12][0-9]|3[01]))|(?:[0-9]{4}-(?:0[469]|11)-(?:0[1-9]|[12][0-9]|30))|(?:[0-9]{4}-02-(?:0[1-9]|1[0-9]|2[0-8])))|(?:(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29))$/;
  return regex.test(dateString);
};

export const isValidTime = (dateString: string): boolean => {
  const regex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const time = dateString.split(" ")[1];
  return regex.test(time);
};

export const isPastDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) {
    throw new Error("Date string format is invalid");
  }
  const now = format(new Date(), "yyyy-MM-dd");
  const today = parse(now, "yyyy-MM-dd", new Date());
  const selectedDate = parse(dateString, "yyyy-MM-dd", new Date());
  // Checking if the selected date is a previous date
  const isPast = compareAsc(selectedDate, today);
  if (isPast === -1) return true;
  return false;
};

export const isWorkingDay = (dateString: string): boolean => {
  if (!isValidDate(dateString)) {
    throw new Error("Date string format is invalid.");
  }
  const selectedDate = format(new Date(dateString), "MM-dd");
  // Getting the day of the week from selected date, where 1 = monday.
  const weekDay = new Date(dateString).getDay();
  // Checking if the selected date is in the list of holiday dates
  if (HOLIDAY_DATES.includes(selectedDate) || !WORKING_DAYS.includes(weekDay))
    return false;
  return true;
};

// Checking if appointment start time is before opening hours(9:00 in this case)
// Expects format of "2022-04-23 06:00"
export const isBeforeOpeningHour = (dateString: string): boolean => {
  const date = dateString.split(" ")[0];
  if (!isValidDate(date)) {
    throw new Error("Date string format is invalid");
  }
  if (!isValidTime(dateString)) {
    throw new Error("Time is invalid");
  }

  const hour = Number(format(new Date(dateString), "H"));

  // Checking if date time string falls within operating hours
  if (hour < config.OPENING_HOUR || hour > config.CLOSING_HOUR) {
    return true;
  }
  return false;
};

// Checking if appointment start time is after closing hours(18:00 in this case)
export const isAfterClosingHour = (dateString: string): boolean => {
  if (!isValidDate(dateString)) {
    throw new Error("Date string format is invalid");
  }
  return Number(format(new Date(dateString), "H")) > config.CLOSING_HOUR;
};

// Checking if the date of the appointment start or end time is the current date.
export const isCurrentDate = (date: Date): boolean => {
  return getDateOfficial(date) === getCurrentDate();
};

// Getting the difference in hours between two date times
export const getDifference = (start: Date, end: Date): number => {
  return Number(format(end, "H")) - Number(format(start, "H"));
};

export const isTwoHoursApart = (start: Date, end: Date): boolean => {
  return getDifference(start, end) === 2;
};

// To check appointment start or end time is even. for example 10, 12, 14, 16, 18.
export const isEven = (time: Date): boolean => {
  return Number(format(time, "H")) % 2 === 0;
};

// Checking if appointment start or end time has any minutes.
export const isZeroMinutes = (time: Date): boolean => {
  return time.getMinutes() === 0;
};

// Getting a date in the format 09.02.1980 for example.
export const getDateOfficial = (startTime: Date): string => {
  return format(startTime, "dd.MM.yyyy");
};

// Getting the hour from a date time object in the format 09:00 for example.
export const getHourOfficial = (startTime: Date): string => {
  return format(startTime, "HH:mm");
};

// Where format is for example 15:00
export const getCurrentTime = (): string => {
  return format(new Date(), "HH:mm");
};

// Where format is for example 02.05.2025
export const getCurrentDate = (): string => {
  return format(new Date(), "dd.MM.yyyy");
};

// Getting the number of months between the date of the appointment start time and the current date
export const isOverThreeMonths = (startTime: Date): boolean => {
  const date = startTime.toISOString().split("T")[0];
  // Checking if the appointment start time is a past date
  if (isPastDate(date)) {
    return true;
  }
  const numberOfMonths = differenceInMonths(startTime, new Date());

  if (numberOfMonths > 3 || numberOfMonths < 0) {
    return true;
  }
  return false;
};

// Converting a date time string to an ISO 18601 date time format.
export const convertDateTimeToISO8601 = (dateTime: string): Date => {
  return parse(`${dateTime}`, "yyyy-MM-dd HH:mm", new Date());
};

export const convertDateStringTOISO8601 = (dateString: string): Date => {
  return parse(`${dateString}`, "yyyy-MM-dd", new Date());
};

export const convertDateStringFromISO8601 = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
