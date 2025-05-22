import { WorkingHours, Slot } from "../types";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";
import { parse, isBefore, format, addMinutes } from "date-fns";
import { convertToISO8601 } from "../utils/helpers";
import Appointment, { IAppointment } from "../model/appointment";
import { DateTime } from "luxon";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";

// Helper function for filtering already booked appointments
const isSlotAvailable = (
  slotStart: Date,
  slotEnd: Date,
  appointments: IAppointment[]
): boolean => {
  return !appointments.some((appt) => {
    return slotStart < appt.endTime && slotEnd > appt.startTime;
  });
};

// Generating available appointment time slots in ISO 8601 date format
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

  // Converting slot start and end times to ISO 8601 date time object
  while (
    isBefore(addMinutes(current, durationMinutes), addMinutes(endTime, 1))
  ) {
    const slotStart = format(current, "HH:mm");
    const slotEnd = format(addMinutes(current, durationMinutes), "HH:mm");
    slots.push({
      start: convertToISO8601(date_string, slotStart),
      end: convertToISO8601(date_string, slotEnd)
    });

    current = addMinutes(current, durationMinutes);
  }

  return slots;
};

const getExistingAppointments = async (
  selectedDate: string
): Promise<IAppointment[] | Error | InternalServerError> => {
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
    if (err instanceof Error) {
      // If we get an error that means an error occured on the database
      return new InternalServerError({
        message: "An error occured on the database server",
        statusCode: 500
      });
    }
    return new Error("An unknown error occured");
  }
};

// Slot generation helper functions
export const generateAvailableSlots = async (
  date_string: string
): Promise<Slot[] | InternalServerError | Error> => {
  try {
    const checkAvailable = isSlotAvailable;

    const generatedSlots = generateSlots(
      date_string,
      WORKING_HOURS,
      SLOT_DURATION_MINUTES
    );

    const existingAppointments = await getExistingAppointments(date_string);

    if (
      existingAppointments instanceof Error ||
      existingAppointments instanceof InternalServerError
    )
      return new InternalServerError({
        message: "An error occured on the database server",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });

    const availableSlots = generatedSlots.filter((slot) =>
      checkAvailable(slot.start, slot.end, existingAppointments)
    );
    return availableSlots;
  } catch (err: unknown) {
    if (err instanceof InternalServerError || err instanceof Error) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// User email confirmation helper function
export const confirmUserEmail = async (
  appointment: IAppointment
): Promise<IAppointment | InternalServerError | Error> => {
  try {
    appointment.emailSent = true;
    const emailConfirmedAppointment = await appointment.save();
    if (!emailConfirmedAppointment) {
      throw new InternalServerError({
        message: "Failed to update document",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return emailConfirmedAppointment;
  } catch (err: unknown) {
    if (err instanceof InternalServerError) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// Appointment creation helper function
export const createNewAppointment = async (
  appointmentInfo: IAppointment
): Promise<IAppointment | InternalServerError | Error> => {
  try {
    const newAppointment = new Appointment(appointmentInfo);
    const savedAppointment = await newAppointment.save();
    if (!savedAppointment) {
      throw new InternalServerError({
        message: "Failed to create new appointment document",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return savedAppointment;
  } catch (err: unknown) {
    if (err instanceof InternalServerError) {
      return err;
    }
    return new Error("An unknown error occured");
  }
};

// Appointment cancellation helper function
export const cancelAppointment = async (
  appointmentID: string
): Promise<
  IAppointment | EntityNotFoundError | InternalServerError | Error
> => {
  try {
    const appointment = await Appointment.findOne({
      appointmentId: appointmentID
    });
    // Checking if the appointment exist
    if (!appointment)
      throw new EntityNotFoundError({
        message: `Appointment with appointment ID (${appointmentID}) not found`,
        statusCode: 404,
        code: "NOT_FOUND"
      });

    // Checking if the appointment had already been cancelled.
    // In a scenario where the user attempts to cancel an appointment
    // but didn't get a UI update maybe due to loss of internet connection
    if (appointment.status === "cancelled") {
      return new Error("Appointment already cancelled"); // This is a place holder. Still thinking of what error to throw here
    }
    // Updating appointment satus
    appointment.status = "cancelled";
    const cancelledAppointment = await appointment.save();
    // Checking if update was successful
    if (!cancelAppointment) {
      throw new InternalServerError({
        message:
          "An error occured on database server: Couldn't cancel appointment",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }
    return cancelledAppointment;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof EntityNotFoundError
    ) {
      return err;
    }
    return new Error("An unknown error occurred");
  }
};
