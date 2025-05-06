import { WorkingHours, Slot, IAppointment } from "../types";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";
import { parse, isBefore, format, addMinutes } from "date-fns";
import dateHelper from "../utils/dateHelper";
import Appointment from "../model/appointment";
import { DateTime } from "luxon";

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  appointments: IAppointment[]
): boolean {
  return !appointments.some((appt) => {
    return slotStart < appt.endTime && slotEnd > appt.startTime;
  });
}

// Slot generation helper function
const generateSlots = (
  date_string: string,
  workHours: WorkingHours,
  durationMinutes: number
): Slot[] => {
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

  const slots: Slot[] = [];
  let current = startTime;

  while (
    isBefore(addMinutes(current, durationMinutes), addMinutes(endTime, 1))
  ) {
    const slotStart = format(current, "HH:mm");
    const slotEnd = format(addMinutes(current, durationMinutes), "HH:mm");
    slots.push({
      start: dateHelper.convertToHour(date_string, slotStart),
      end: dateHelper.convertToHour(date_string, slotEnd)
    });

    current = addMinutes(current, durationMinutes);
  }
  return slots;
};

const getExistingAppointments = async (
  selectedDate: string
): Promise<IAppointment[] | Error> => {
  try {
    const dateStr = selectedDate;

    const start = DateTime.fromISO(dateStr, {
      zone: "Europe/Helsinki"
    }).startOf("day");
    const end = start.plus({ days: 1 });

    const startUTC = start.toUTC().toJSDate();
    const endUTC = end.toUTC().toJSDate();

    // Quering the database for appointment documents created on requested date
    const appointments = await Appointment.find({
      createdAt: {
        $gte: startUTC,
        $lt: endUTC
      },
      status: "confirmed"
    });
    return appointments;
  } catch (err: unknown) {
    let error;
    if (err && err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

const generateAvailableSlots = async (
  date_string: string
): Promise<Slot[] | Error> => {
  try {
    const checkAvailable = isSlotAvailable;

    const generatedSlots = generateSlots(
      date_string,
      WORKING_HOURS,
      SLOT_DURATION_MINUTES
    );

    const existingAppointments = await getExistingAppointments(date_string);

    if (!existingAppointments)
      return new Error("An error occured in database server");

    const availableSlots = generatedSlots.filter((slot) =>
      checkAvailable(
        slot.start,
        slot.end,
        existingAppointments as IAppointment[]
      )
    );

    return availableSlots;
  } catch (err: unknown) {
    let error = undefined;
    if (err && err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

const confirmUserEmail = async (
  appointment: IAppointment
): Promise<IAppointment | Error> => {
  try {
    appointment.emailSent = true;
    const emailConfirmedAppointment = await appointment.save();
    return emailConfirmedAppointment;
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    return error as Error;
  }
};

const createNewAppointment = async (
  appointmentInfo: IAppointment
): Promise<IAppointment | Error> => {
  try {
    const newAppointment = new Appointment(appointmentInfo);
    const savedAppointment = await newAppointment.save();
    return savedAppointment;
  } catch (err: unknown) {
    let errorObject = undefined;
    if (err instanceof Error) {
      errorObject = err;
    }
    return errorObject as Error;
  }
};

export default {
  generateAvailableSlots,
  createNewAppointment,
  confirmUserEmail
};
