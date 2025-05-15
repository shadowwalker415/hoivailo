import { Router, IRouter, Request, Response, NextFunction } from "express";
import {
  validateAppointmentCancellationBody,
  validateAppointmentRequestBody
} from "../utils/parsers";
import appointmentService from "../services/appointmentService";
import emailService from "../services/emailService";

const appointmentRouter: IRouter = Router();

// Route handler for booking appointments
appointmentRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const requestedAppointment = validateAppointmentRequestBody(req.body);

      // Creating a new appointment document on the database
      const savedAppointment = await appointmentService.createNewAppointment(
        requestedAppointment
      );
      if (savedAppointment instanceof Error)
        throw new Error(savedAppointment.message);

      // Sending response to client
      res.status(200).json({
        ok: true,
        status: 200,
        data: {
          message: `Appointment successfully booked for ${savedAppointment.email}`
        }
      });

      // Async fire-and-forget with IIFE for emailing the user and admin about successful booked appointment.
      (async () => {
        try {
          // Sending appointment confirmation notification email to user
          const sentUserEmail = await emailService.sendUserConfirmationEmail(
            savedAppointment
          );
          if (!sentUserEmail) throw new Error("Failed to send email");

          //Confirming email notification has been sent to user
          const confirmedAppointment =
            await appointmentService.confirmUserEmail(savedAppointment);
          if (confirmedAppointment instanceof Error)
            throw new Error("User confirmation email failed to send");
          // Sending new appointment notification email to admin
          await emailService.sendAdminConfirmationEmail(confirmedAppointment);
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error("An error occured");
        }
      })();
    } catch (err: unknown) {
      let error = undefined;
      if (err instanceof Error) {
        error = err;
        next(error);
      } else {
        next(new Error("unknown error"));
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
      const cancelledAppointment = await appointmentService.cancelAppointment(
        validatedBody.appointmentId
      );
      if (cancelledAppointment instanceof Error) {
        throw new Error("Couldn't cancel appointment");
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
      (async () => {
        try {
          // Sending appointment cancellation notification email to user
          await emailService.sendCancellationEmailUser(
            cancelledAppointment,
            validatedBody.reason
          );

          // Sending appointment cancellation notification email to admin
          await emailService.sendCancellationEmailAdmin(
            cancelledAppointment,
            validatedBody.reason
          );
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error("An error occured");
        }
      })();
    } catch (err: unknown) {
      let error = undefined;
      if (err instanceof Error) {
        error = err;
        next(error);
      } else {
        next(new Error("unknown error"));
      }
    }
  }
);

export default appointmentRouter;
