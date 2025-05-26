import { Router, IRouter, Request, Response, NextFunction } from "express";
import {
  validateAppointmentCancellationBody,
  validateAppointmentRequestBody
} from "../utils/parsers";
import {
  createNewAppointment,
  cancelAppointment
} from "../services/appointmentService";
// import { sendAppointmentEmails } from "../tasks/sendAppointmentEmails";
import { sendCancellationEmails } from "../tasks/sendCancellationEmails";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";

const appointmentRouter: IRouter = Router();

// Route handler for booking appointments
appointmentRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const requestedAppointment = validateAppointmentRequestBody(req.body);

      // Creating a new appointment document on the database
      const savedAppointment = await createNewAppointment(requestedAppointment);
      if (
        savedAppointment instanceof Error ||
        savedAppointment instanceof InternalServerError
      ) {
        throw new InternalServerError({
          message: savedAppointment.message,
          statusCode: 500
        });
      }

      // Sending response to client
      res.status(200).json({
        ok: true,
        status: 200,
        data: {
          message: `Appointment successfully booked for ${savedAppointment.email}`
        }
      });

      // Async fire-and-forget with IIFE for emailing the user and admin about successful booked appointment.
      // (async () => sendAppointmentEmails(savedAppointment))();
    } catch (err: unknown) {
      if (err instanceof Error || err instanceof InternalServerError) {
        next(err);
      } else {
        next(new Error("An unknown error occured"));
      }
    }
  }
);

// Route handler for cancelling appointments
appointmentRouter.post(
  "/cancel",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const validatedBody = validateAppointmentCancellationBody(req.body);

      // Cancelling appointment
      const cancelledAppointment = await cancelAppointment(
        validatedBody.appointmentId
      );
      // Checking if the database operation failed
      if (
        cancelledAppointment instanceof InternalServerError ||
        cancelledAppointment instanceof Error
      ) {
        throw new InternalServerError({
          message: cancelledAppointment.message,
          statusCode: 500,
          code: "INTERNAL_SERVER_ERROR"
        });
      }
      // Checking if the appointment was not found
      if (cancelledAppointment instanceof EntityNotFoundError) {
        throw new EntityNotFoundError({
          message: cancelledAppointment.message,
          statusCode: cancelledAppointment.statusCode,
          code: cancelledAppointment.code
        });
      }
      // Sending response to client
      res.status(201).json({
        ok: true,
        status: 201,
        data: {
          message: `Appointment successfully cancelled for ${cancelledAppointment.email}`
        }
      });

      // Async fire-and-forget with IIFE for emailing user and admin about appointment cancellation
      (async () =>
        sendCancellationEmails(cancelledAppointment, validatedBody.reason))();
    } catch (err: unknown) {
      if (
        err instanceof Error ||
        err instanceof InternalServerError ||
        err instanceof EntityNotFoundError
      ) {
        next(err);
      } else {
        next(new Error("An unknown error occured"));
      }
    }
  }
);

export default appointmentRouter;
