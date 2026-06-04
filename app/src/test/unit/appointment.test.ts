import { isSlotAvailable } from "../../services/appointments";
import { convertDateTimeToISO8601 } from "../../utils/helpers";
import assert from "node:assert";

describe("isSlotAvailable()", () => {
  it("Returns false for already booked appointment slot", () => {
    const slot = {
      startTime: "2026-03-21 09:00",
      endTime: "2026-03-21 11:00"
    };

    const bookedAppointments = [
      {
        startTime: convertDateTimeToISO8601("2026-03-21 09:00"),
        endTime: convertDateTimeToISO8601("2026-03-21 11:00")
      },
      {
        startTime: convertDateTimeToISO8601("2026-03-21 13:00"),
        endTime: convertDateTimeToISO8601("2026-03-21 15:00")
      }
    ];
    const result = isSlotAvailable(
      slot.startTime,
      slot.endTime,
      bookedAppointments as any
    );
    assert.strictEqual(result, false);
  });

  it("Returns true for not yet booked appointment slot", () => {
    const slot = {
      startTime: "2026-03-21 15:00",
      endTime: "2026-03-21 17:00"
    };

    const bookedAppointments = [
      {
        startTime: convertDateTimeToISO8601("2026-03-21 09:00"),
        endTime: convertDateTimeToISO8601("2026-03-21 11:00")
      },
      {
        startTime: convertDateTimeToISO8601("2026-03-21 13:00"),
        endTime: convertDateTimeToISO8601("2026-03-21 15:00")
      }
    ];

    const result = isSlotAvailable(
      slot.startTime,
      slot.endTime,
      bookedAppointments as any
    );
    assert.strictEqual(result, true);
  });
});
