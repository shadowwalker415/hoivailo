import { WorkingHours, Slot } from "../types";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";
import { parse, isBefore, format, addMinutes } from "date-fns";
import dateHelper from "../utils/dateHelper";
import Appointment, { IAppointment } from "../model/appointment";
import { DateTime } from "luxon";

const isSlotAvailable = (
  slotStart: Date,
  slotEnd: Date,
  appointments: IAppointment[]
): boolean => {
  return !appointments.some((appt) => {
    return slotStart < appt.endTime && slotEnd > appt.startTime;
  });
};

// Generating available appointment time slots in ISO 18601 date format
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
      start: dateHelper.convertToISO18601(date_string, slotStart),
      end: dateHelper.convertToISO18601(date_string, slotEnd)
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
      }
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

    if (existingAppointments instanceof Error)
      return new Error("An error occured in database server");

    const availableSlots = generatedSlots.filter((slot) =>
      checkAvailable(slot.start, slot.end, existingAppointments)
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

const cancelAppointment = async (
  appointmentID: string
): Promise<IAppointment | Error> => {
  try {
    const appointment = await Appointment.findOne({
      appointmentId: appointmentID
    });
    if (!appointment) throw new Error("Appointment not found");

    // Checking if the appointment had already been cancelled.
    // In a scenario where the user attempts to cancel an appointment
    // but didn't get a UI update maybe due to loss of internet connection
    if (appointment.status === "cancelled") {
      throw new Error("Appointment had already been cancelled");
    }
    appointment.status = "cancelled";
    const cancelledAppointment = await appointment.save();
    return cancelledAppointment;
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
      console.log(err.message);
    }
    return error as Error;
  }
};

export default {
  generateAvailableSlots,
  createNewAppointment,
  cancelAppointment,
  confirmUserEmail
};
