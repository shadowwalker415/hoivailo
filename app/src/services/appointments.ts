import { WorkingHours, Slot } from "../types";
import {
  WORKING_HOURS,
  SLOT_DURATION_MINUTES
} from "../utils/availability.config";
import { parse, isBefore, format, addMinutes } from "date-fns";
import { convertToISO8601 } from "../utils/helpers";
import Appointment, { IAppointment } from "../model/appointment";
// import { DateTime } from "luxon";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";

// Helper function for filtering already booked appointments.
const isSlotAvailable = (
  slotStart: string,
  slotEnd: string,
  appointments: IAppointment[]
): boolean => {
  return !appointments.some((appt) => {
    return (
      convertToISO8601(slotStart) < appt.endTime &&
      convertToISO8601(slotEnd) > appt.startTime
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

const getExistingAppointments = async (
  _selectedDate: string
): Promise<IAppointment[] | Error | InternalServerError> => {
  try {
    // const dateStr = selectedDate;

    // const start = DateTime.fromISO(dateStr, {
    //   zone: "Europe/Helsinki"
    // }).startOf("day");
    // const end = start.plus({ days: 1 });

    // const startUTC = start.toUTC().toJSDate();
    // const endUTC = end.toUTC().toJSDate();

    // Quering the database for appointment documents created on requested date
    // const appointments = await Appointment.find({
    //   createdAt: {
    //     $gte: startUTC,
    //     $lt: endUTC
    //   }
    // });

    const appointments = await Appointment.find({});
    return appointments;
  } catch (err: unknown) {
    if (err instanceof Error) {
      // If we get an error that means an error occured on the database.
      return new InternalServerError({
        message: "An error occured on the database server",
        statusCode: 500
      });
    }
    return new Error("An unknown error occured");
  }
};

// Slot generation helper functions.
export const generateAvailableSlots = async (
  date_string: string
): Promise<Slot[] | InternalServerError | Error> => {
  try {
    const generatedSlots = generateSlots(
      date_string,
      WORKING_HOURS,
      SLOT_DURATION_MINUTES
    );

    const existingAppointments = await getExistingAppointments(date_string);

    if (!existingAppointments) {
      throw new InternalServerError({
        message: "An error occured on the database server",
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR"
      });
    }

    if (
      existingAppointments instanceof Error ||
      existingAppointments instanceof InternalServerError
    )
      return new InternalServerError({
        message: "An error occured on the database server",
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
    return new Error("An unknown error occured");
  }
};

export const markAppointmentEmailSent = async (
  appointmentId: string
): Promise<void> => {
  try {
    // Marking the Appointment emailSent field to true.
    // Making sure if emailSent is already set to true then we skip the operation.
    await Appointment.updateOne(
      { appointmentId: appointmentId, emailSent: false },
      { $set: { emailSent: true } },
      (err: unknown, _doc: IAppointment) => {
        if (err instanceof Error) {
          throw new Error(
            `An error occured while attempting to update appointent: ${err.message}`
          );
        }
      }
    );
  } catch (err: unknown) {
    if (err instanceof InternalServerError || err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("An unknown error occured");
  }
};

// Appointment creation helper function.
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
    if (err instanceof InternalServerError || err instanceof Error) {
      return err;
    }
    return new Error("An unknown error occured");
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
    // In a scenario where the user attempts to cancel an appointment.
    // But didn't get a UI update maybe due to loss of internet connection.
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
    // Checking if update was successful.
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
      err instanceof EntityNotFoundError ||
      err instanceof Error
    ) {
      return err;
    }
    return new Error("An unknown error occurred");
  }
};
