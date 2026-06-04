import { WorkingHours, Slot } from "../types";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";
import { parse, isBefore, format, addMinutes } from "date-fns";
import {
  convertDateStringTOISO8601,
  convertDateTimeToISO8601,
  getDateOfficial
} from "../utils/helpers";
import { IAppointment, Appointment } from "../model/appointment";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";

// Helper function for filtering already booked appointments.
export const isSlotAvailable = (
  startTime: string,
  endTime: string,
  appointments: IAppointment[]
): boolean => {
  return !appointments.some((appointment) => {
    return (
      convertDateTimeToISO8601(startTime) < appointment.endTime &&
      convertDateTimeToISO8601(endTime) > appointment.startTime
    );
  });
};

// Generating available appointment time slots in ISO 8601 date format.
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

  // Converting slot start and end times to ISO 8601 date time object.
  while (
    isBefore(addMinutes(current, durationMinutes), addMinutes(endTime, 1))
  ) {
    const slotStart = format(current, "HH:mm");
    const slotEnd = format(addMinutes(current, durationMinutes), "HH:mm");
    slots.push({
      startTime: `${date_string} ${slotStart}`,
      endTime: `${date_string} ${slotEnd}`
    });

    current = addMinutes(current, durationMinutes);
  }

  return slots;
};

// Gets existing appointments from database.
const getExistingAppointments = async (
  appointmentDate: string
): Promise<IAppointment[] | InternalServerError> => {
  try {
    // Getting all existing appointments for selected date.
    const appointments = await Appointment.find({ appointmentDate });
    return appointments;
  } catch (err: unknown) {
    if (err instanceof Error) {
      // If we get an error that means an error occured on the database.
      return new InternalServerError({
        message: err.message,
        statusCode: 500
      });
    }
    return new InternalServerError({
      message: "An unknown error occured getting existing appointments",
      statusCode: 500
    });
  }
};

// Generates available appointment slots
export const generateAvailableSlots = async (
  date_string: string
): Promise<Slot[] | InternalServerError | Error> => {
  try {
    // Generating time slots.
    const generatedSlots = generateSlots(
      date_string,
      WORKING_HOURS,
      SLOT_DURATION_MINUTES
    );

    // Getting existing appointments from the database.
    const existingAppointments = await getExistingAppointments(
      getDateOfficial(convertDateStringTOISO8601(date_string))
    );

    // Checking if getting existing appointments from the database resulted in an error.
    if (existingAppointments instanceof InternalServerError)
      return new InternalServerError({
        message: existingAppointments.message,
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });

    // Generating appointmenet slots
    const availableSlots = generatedSlots.filter((slot) =>
      isSlotAvailable(slot.startTime, slot.endTime, existingAppointments)
    );
    return availableSlots;
  } catch (err: unknown) {
    if (err instanceof InternalServerError || err instanceof Error) {
      return err;
    }
    return new Error("An unknown error occured generating available slots");
  }
};

export const createNewAppointment = async (
  appointmentInfo: IAppointment
): Promise<IAppointment | InternalServerError | Error> => {
  try {
    const newAppointment = new Appointment({
      ...appointmentInfo,
      appointmentDate: getDateOfficial(appointmentInfo.startTime)
    });
    const savedAppointment = await newAppointment.save();

    return savedAppointment;
  } catch (err: unknown) {
    if (err instanceof Error) {
      return err;
    }
    return new InternalServerError({
      message:
        "An unknown error occured creating a new appointment document on the database",
      statusCode: 500
    });
  }
};

// Appointment cancellation helper function.
export const cancelAppointment = async (
  appointmentID: string
): Promise<
  IAppointment | EntityNotFoundError | InternalServerError | Error
> => {
  try {
    const appointment = await Appointment.findOne({
      appointmentId: appointmentID
    });
    // Checking if the appointment exist.
    if (!appointment)
      // This is a place holder. We will redirect to a not found page if appointment was not found.
      throw new EntityNotFoundError({
        message: `Appointment with appointment ID (${appointmentID}) not found`,
        statusCode: 404,
        code: "NOT_FOUND"
      });

    // Checking if the appointment had already been cancelled.
    if (appointment.status === "cancelled") {
      return new InternalServerError({
        message: "Appointment already cancelled",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      }); // This is a place holder. Still thinking of what error to throw here.
    }
    // Updating appointment satus.
    appointment.status = "cancelled";
    const cancelledAppointment = await appointment.save();

    return cancelledAppointment;
  } catch (err: unknown) {
    if (
      err instanceof InternalServerError ||
      err instanceof EntityNotFoundError ||
      err instanceof Error
    ) {
      return err;
    }
    return new InternalServerError({
      message:
        "An unknown error occured canceling booked appointment on the database",
      statusCode: 500
    });
  }
};
