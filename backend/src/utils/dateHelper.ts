import { format, compareAsc } from "date-fns";

const isValidDate = (date_string: string): boolean => {
  // Regular expression for valid string where string format is yyyy-mm-dd
  return /^(?:(?:19|20)\d{2})-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|02-(?:0[1-9]|1\d|2[0-8])|02-29(?=-(?:19|20)(?:[02468][048]|[13579][26])))$/.test(
    date_string
  );
};

const isPastDate = (date_string: string): boolean => {
  const today = format(new Date(), "yyyy-MM-dd");
  const selectedDate = format(new Date(date_string), "yyyy-MM-dd");
  // Checking if the selected date is a past date
  const isPast = compareAsc(selectedDate, today);
  if (isPast === -1) return true;
  return false;
};

export default {
  isValidDate,
  isPastDate
};
