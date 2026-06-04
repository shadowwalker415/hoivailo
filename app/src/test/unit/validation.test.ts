import assert from "node:assert";
import {
  isWorkingDay,
  isPastDate,
  isValidDate,
  isBeforeOpeningHour,
  isOverThreeMonths,
  isAfterClosingHour
} from "../../utils/helpers";
import {
  getNextWorkingDay,
  wasYesterday,
  currentDay,
  isTomorrow,
  getNextWeekend,
  getNextPublicHoliday,
  overThreeMonthsDate
} from "../testHelpers";
import { format } from "date-fns";

describe("isWorkingDay()", () => {
  it("Returns true for weekdays and non public holidays", () => {
    const day = getNextWorkingDay();
    const result = isWorkingDay(day);
    assert.strictEqual(result, true);
  });

  it("Returns false for weekends", () => {
    const day = getNextWeekend();
    const result = isWorkingDay(day);
    assert.strictEqual(result, false);
  });

  it("Returns false for public holidays", () => {
    const day = getNextPublicHoliday();
    const result = isWorkingDay(day);
    assert.strictEqual(result, false);
  });
});

describe("isPastDate()", () => {
  it("Returns true  for past dates", () => {
    const day = wasYesterday();
    const result = isPastDate(day);
    assert.strictEqual(true, result);
  });

  it("Returns false for date that is the current day", () => {
    const day = currentDay();
    const result = isPastDate(day);
    assert.strictEqual(result, false);
  });

  it("Returns false for dates that are future dates", () => {
    const day = isTomorrow();
    const result = isPastDate(day);
    assert.strictEqual(result, false);
  });
});

describe("isValidDate()", () => {
  it("Returns true for valid date string formats", () => {
    // Where valid date string format is for example 1998-09-23
    const date = format(new Date(), "yyyy-MM-dd");
    const result = isValidDate(date);
    assert.strictEqual(result, true);
  });

  it("Returns false for invalid date string formats", () => {
    // Where invalid date string format is for example 05-10-1998
    const date = format(new Date(), "MM-dd-yyyy");
    const result = isValidDate(date);
    assert.strictEqual(result, false);
  });

  it("Returns false for invalid dates (Not leap year)", () => {
    // Not a leap year
    const invalidDate = "2023-02-29";
    const result = isValidDate(invalidDate);
    assert.strictEqual(result, false);
  });

  it("Returns false for invalid dates (Date overflow)", () => {
    const invalidDate = "2026-04-31";
    const result = isValidDate(invalidDate);
    assert.strictEqual(result, false);
  });

  it("Returns false for random strings", () => {
    const date = "Hello world";
    const result = isValidDate(date);
    assert.strictEqual(result, false);
  });
});

describe("isBeforeOpeningHour()", () => {
  it("Returns true for date time strings that are before opening hours", () => {
    // 6AM for this test case
    const time = "2025-04-12 06:00";
    const result = isBeforeOpeningHour(time);
    assert.strictEqual(result, true);
  });

  it("Returns false for date time strings that fall within opening hours", () => {
    const time = "2025-04-12 09:00";
    const result = isBeforeOpeningHour(time);
    assert.strictEqual(result, false);
  });

  it("Returns true for date time strings that is after closing hours", () => {
    const time = "2025-04-12 19:00";
    const result = isBeforeOpeningHour(time);
    assert.strictEqual(result, true);
  });
});

describe("isOverThreeMonths()", () => {
  it("Returns true for date over three months away from current date", () => {
    const dateString = overThreeMonthsDate();
    const result = isOverThreeMonths(new Date(dateString));
    assert.strictEqual(result, true);
  });

  it("Returns true for past dates", () => {
    const dateString = wasYesterday();
    const result = isOverThreeMonths(new Date(dateString));
    assert.strictEqual(result, true);
  });

  it("Returns false for date not over three months from current date", () => {
    const dateString = currentDay();
    const result = isOverThreeMonths(new Date(dateString));
    assert.strictEqual(result, false);
  });
});

describe("isAfterClosingHour()", () => {
  it("Returns false for date time strings that are within work hours", () => {
    const time = "2025-04-12 10:00";
    const result = isAfterClosingHour(time);
    assert.strictEqual(result, false);
  });

  it("Returns true for date time strings that are over closing hour", () => {
    const time = "2025-04-12 19:00";
    const result = isAfterClosingHour(time);
    assert.strictEqual(result, true);
  });

  it("Returns true for date time strings that are before opening hours", () => {
    const time = "2025-04-12 07:00";
    const result = isAfterClosingHour(time);
    assert.strictEqual(result, true);
  });
});
