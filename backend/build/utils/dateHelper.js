"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
const availability_config_1 = require("./availability.config");
const isValidDate = (date_string) => {
    // Regular expression for valid date string where date string format is yyyy-mm-dd
    return /^(?:(?:19|20)\d{2})-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\d|30)|02-(?:0[1-9]|1\d|2[0-8])|02-29(?=-(?:19|20)(?:[02468][048]|[13579][26])))$/.test(date_string);
};
const isPastDate = (date_string) => {
    const today = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd");
    const selectedDate = (0, date_fns_1.format)(new Date(date_string), "yyyy-MM-dd");
    // Checking if the selected date is a previous date
    const isPast = (0, date_fns_1.compareAsc)(selectedDate, today);
    if (isPast === -1)
        return true;
    return false;
};
const isWorkingDay = (date_string) => {
    if (!isValidDate(date_string))
        return false;
    const selectedDate = (0, date_fns_1.format)(new Date(date_string), "MM-dd");
    const weekDay = new Date(date_string).getDay();
    if (availability_config_1.HOLIDAY_DATES.includes(selectedDate) || !availability_config_1.WORKING_DAYS.includes(weekDay))
        return false;
    return true;
};
exports.default = {
    isValidDate,
    isPastDate,
    isWorkingDay
};
