import { Router, IRouter, Request, Response, NextFunction } from "express";
import {
  validateAppointmentCancellationBody,
  validateAppointmentRequestBody
} from "../utils/parsers";
import {
  createNewAppointment,
  cancelAppointment
} from "../services/appointmentService";
import { sendAppointmentEmails } from "../tasks/sendAppointmentEmails";
import { sendCancellationEmails } from "../tasks/sendCancellationEmails";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";

const appointmentRouter: IRouter = Router();

//
appointmentRouter.get("/cancel", (_req: Request, res: Response) => {
  res.status(200).render("cancelAppointment");
});

appointmentRouter.get(
  "/select-appointment-date",
  (_req: Request, res: Response) => {
    res.status(200).render("selectDate");
  }
);

// Route handler for booking appointments
appointmentRouter.post(
  "/booking",
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
      } else {
        // Sending response to client
        res.status(201).render("appointmentSuccess", { savedAppointment });
      }

      //  Fire-and-forget Async job with IIFE for emailing the user and admin on appointment booking success.
      (async () => sendAppointmentEmails(savedAppointment))();
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

      // Checking if the appointment was not found
      if (cancelledAppointment instanceof EntityNotFoundError) {
        res.status(404).render("404NotFound", { validatedBody });
        // Checking if the appointment had already been cancelled
      } else if (
        cancelledAppointment instanceof InternalServerError &&
        cancelledAppointment.message === "Appointment already cancelled"
      ) {
        res.status(201).render("alreadyCancelled", { validatedBody });
        // Checking if the database operation failed
      } else if (cancelledAppointment instanceof Error) {
        throw new InternalServerError({
          message:
            "An error occured on the database, couldn't cancel appointment",
          statusCode: 500,
          code: "INTERNAL_SERVER_ERROR"
        });
      } else {
        // Sending response to client
        res.status(201).render("cancellationSuccess", { cancelledAppointment });

        // Fire-and-forget Async job with IIFE for emailing user and admin on appointment cancellation success.
        (async () =>
          sendCancellationEmails(cancelledAppointment, validatedBody.reason))();
      }
    } catch (err: unknown) {
      if (err instanceof InternalServerError) {
        next(err);
      } else {
        next(new Error("An unknown error occured"));
      }
    }
  }
);

export default appointmentRouter;
