import { format, compareAsc, parse } from "date-fns";
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
  // Checking if the selected date is one of the holiday dates or not a working day
  if (HOLIDAY_DATES.includes(selectedDate) || !WORKING_DAYS.includes(weekDay))
    return false;
  return true;
};

const convertToHour = (date_string: string, time: string): Date => {
  const convertTime = parse(
    `${date_string} ${time}`,
    "yyyy-MM-dd HH:mm",
    new Date()
  );
  return convertTime;
};

export default {
  isValidDate,
  isPastDate,
  isWorkingDay,
  convertToHour
};
