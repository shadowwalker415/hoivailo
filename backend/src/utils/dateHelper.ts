import { format, compareAsc, parse, differenceInMonths } from "date-fns";
import { WORKING_DAYS, HOLIDAY_DATES } from "./availability.config";

const isValidDate = (date_string: string): boolean => {
  // Regular expression for valid date string where date string format is yyyy-mm-dd
  return /^(?:(?:19|20)\d{2})-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|02-(?:0[1-9]|1\d|2[0-8])|02-29(?=-(?:19|20)(?:[02468][048]|[13579][26])))$/.test(
    date_string
  );
};

const isPastDate = (date_string: string): boolean => {
  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = format(new Date(date_string), "yyyy-MM-dd");
  // Checking if the selected date is a previous date
  const isPast = compareAsc(selectedDate, today);
  if (isPast === -1) return true;
  return false;
};

const isWorkingDay = (date_string: string): boolean => {
  if (!isValidDate(date_string)) return false;
  const selectedDate = format(new Date(date_string), "MM-dd");
  // Getting the day of the week from selected date, where 1 = monday.
  const weekDay = new Date(date_string).getDay();
  // Checking if the selected date is in the list of holiday dates
  if (HOLIDAY_DATES.includes(selectedDate) || !WORKING_DAYS.includes(weekDay))
    return false;
  return true;
};

// Checking if appointment start time is less than the normal opening hour(9 in this case)
const isBeforeOpeningHour = (date_string: string): boolean => {
  return Number(format(new Date(date_string), "H")) < 9;
};

// Checking if appointment start time is greater than the closing hour(18 in this case)
const isAfterClosingHour = (date_string: string): boolean => {
  return Number(format(new Date(date_string), "H")) > 18;
};

// Getting the difference in hours between two date times
const getDifference = (start: Date, end: Date): number => {
  return Number(format(end, "H")) - Number(format(start, "H"));
};

// Checking if the appointment start or end time is an even hour. for example 10, 12, 14, 16, 18
const isEven = (time: Date): boolean => {
  return Number(format(time, "H")) % 2 == 0;
};

// Checking if appointment start or end time has any minutes
const isZeroMinutes = (time: Date): boolean => {
  return time.getMinutes() == 0;
};

// Getting a date in the format 09.02.1980 for example
const getDateOfficial = (start_time: Date): string => {
  return format(start_time, "dd.MM.yyyy");
};

// Getting the hour from a date time time object in the format 09:00 for example
const getHourOfficial = (start_time: Date): string => {
  return format(start_time, "HH:mm");
};

const getCurrentTime = (): string => {
  return format(new Date(), "HH:mm");
};

const getCurrentDate = (): string => {
  return format(new Date(), "dd.MM.yyyy");
};

// Getting the number of months between the date of the appointment start time and the current date
const getDifferenceInMonths = (start_time: Date): number => {
  return differenceInMonths(start_time, new Date());
};

// Converting a date string to an ISO 18601 date format.
const convertToISO18601 = (date_string: string, time: string): Date => {
  const convertedTime = parse(
    `${date_string} ${time}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  return convertedTime;
};

export default {
  isValidDate,
  isPastDate,
  isWorkingDay,
  convertToISO18601,
  getDateOfficial,
  getHourOfficial,
  getCurrentTime,
  getCurrentDate,
  getDifferenceInMonths,
  isBeforeOpeningHour,
  isAfterClosingHour,
  getDifference,
  isEven,
  isZeroMinutes
};
