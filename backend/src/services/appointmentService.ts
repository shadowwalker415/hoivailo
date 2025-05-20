import { WorkingHours, Slot } from "../types";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";
import { parse, isBefore, format, addMinutes } from "date-fns";
import helpers from "../utils/helpers";
import Appointment, { IAppointment } from "../model/appointment";
import { DateTime } from "luxon";
import CustomError from "../errors/customError";
import { ErrorCode } from "../errors/types";
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
      start: helpers.convertToISO8601(date_string, slotStart),
      end: helpers.convertToISO8601(date_string, slotEnd)
    });

    current = addMinutes(current, durationMinutes);
  }

  return slots;
};

const getExistingAppointments = async (
  selectedDate: string
): Promise<IAppointment[] | Error | CustomError<ErrorCode>> => {
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
      return err;
    }
    return new CustomError({
      message: "An error occured on the server",
      statusCode: 500
    });
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
      return new CustomError({
        message: "An error occured on the database server",
        statusCode: 500
      });

    const availableSlots = generatedSlots.filter((slot) =>
      checkAvailable(slot.start, slot.end, existingAppointments)
    );
    return availableSlots;
  } catch (err: unknown) {
    if (err instanceof CustomError || err instanceof Error) {
      return new CustomError({ message: err.message, statusCode: 500 });
    }
    return new CustomError({
      message: "An error occured on the server",
      statusCode: 500
    });
  }
};

const confirmUserEmail = async (
  appointment: IAppointment
): Promise<IAppointment | Error> => {
  try {
    appointment.emailSent = true;
    const emailConfirmedAppointment = await appointment.save();
    if (!emailConfirmedAppointment) {
      throw new Error(
        "An error occured on database server: couldn't confirm appointment email address"
      );
    }
    return emailConfirmedAppointment;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new Error("An error occured on the server");
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
    if (err instanceof Error) {
      return err;
    }
    return new Error("An error occured on the server");
  }
};

const cancelAppointment = async (
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
        message: "Appointment not found!",
        statusCode: 400,
        code: "NOT_FOUND"
      });

    // Checking if the appointment had already been cancelled.
    // In a scenario where the user attempts to cancel an appointment
    // but didn't get a UI update maybe due to loss of internet connection
    if (appointment.status === "cancelled") {
      return new Error("Appointment already cancelled");
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
    if (err instanceof InternalServerError) {
      return err;
    }
    return new InternalServerError({
      message: "An error occured on server",
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR"
    });
  }
};

export default {
  generateAvailableSlots,
  createNewAppointment,
  cancelAppointment,
  confirmUserEmail
};
