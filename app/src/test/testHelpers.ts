import { format, addDays } from "date-fns";

const WEEKENDS = [0, 6]; // Where 0 is Sunday and 6 is Saturday
const HOLIDAY_DATES = ["12-24", "12-25", "12-26", "12-31", "01-01"];

const fullDay = (): number => {
  return 1000 * 60 * 60 * 24;
};

const fullMonth = (): number => {
  return 1000 * 60 * 60 * 24 * 31;
};

const getMonthAndDay = (dateString: string): string => {
  return format(new Date(dateString), "MM-dd");
};

export const wasYesterday = (): string => {
  const yesterday = new Date(Date.now() - fullDay())
    .toISOString()
    .split("T")[0];
  return yesterday;
};

export const currentDay = (): string => {
  const today = new Date(Date.now()).toISOString().split("T")[0];
  return today;
};

export const getNextWeekend = (): string => {
  const fullHours = fullDay();
  let currentDate = new Date(Date.now());
  // Checking if the current day is a Saturday or Sunday
  while (!WEEKENDS.includes(currentDate.getDay())) {
    currentDate = new Date(currentDate.getTime() + fullHours);
  }
  return currentDate.toISOString().split("T")[0];
};

export const getNextPublicHoliday = (): string => {
  let currentDate = new Date();
  // Checking if the current day is a public holiday
  while (!HOLIDAY_DATES.includes(format(currentDate, "MM-dd"))) {
    currentDate = addDays(currentDate, 1);
  }

  return format(currentDate, "yyyy-MM-dd");
};

export const getNextWorkingDay = (): string => {
  const completeDay = fullDay();
  let currentDate = new Date(Date.now() + completeDay); // Current date is a next day
  let count = 0;

  while (count < 7) {
    // 7 here is a safety limit
    const date = currentDate.toISOString().split("T")[0];
    if (
      !WEEKENDS.includes(currentDate.getDay()) &&
      !HOLIDAY_DATES.includes(getMonthAndDay(date))
    ) {
      return currentDate.toISOString().split("T")[0];
    }
    currentDate = new Date(currentDate.getTime() + completeDay);
    count++;
  }
  return currentDate.toISOString().split("T")[0];
};

export const overThreeMonthsDate = (): string => {
  return new Date(Date.now() + fullMonth() * 4).toISOString().split("T")[0];
};

export const isTomorrow = (): string => {
  return new Date(Date.now() + fullDay()).toISOString().split("T")[0];
};
