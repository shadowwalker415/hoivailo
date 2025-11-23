import { Router, IRouter, Request, Response, NextFunction } from "express";
import {
  validateAppointmentCancellationBody,
  validateAppointmentRequestBody
} from "../utils/parsers";
import { createNewAppointment, cancelAppointment } from "../tasks/appointments";
import {
  userConfirmationEmailQueue,
  adminConfirmationEmailQueue,
  userCancellationEmailQueue,
  adminCancellationEmailQueue
} from "../jobs/queues/queques";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";
import { IAppointment, ICancelledAppointment } from "../model/appointment";
import { addJobsToQueue } from "../utils/redisHelpers";

// import { IAppointment } from "../model/appointment";

const appointmentRouter: IRouter = Router();

appointmentRouter.get("/peruta", (_req: Request, res: Response) => {
  res.status(200).render("cancelAppointment");
});

appointmentRouter.get("/valitse-paivamaara", (_req: Request, res: Response) => {
  res.status(200).render("selectDate");
});

// Route handler for booking appointments
appointmentRouter.post(
  "/aika",
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
        // We will redirect to the appointment success.
        // res.redirect(303, "aika/onnistuminnen");
        res.status(201).render("appointmentSuccess", { savedAppointment });
      }
      // Adding email background jobs to their various queues
      await addJobsToQueue(
        userConfirmationEmailQueue,
        "user-email-confirmation",
        savedAppointment
      );

      await addJobsToQueue(
        adminConfirmationEmailQueue,
        "admin-email-confirmation",
        { ...savedAppointment } as IAppointment
      );
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
  "/peruta",
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
        // We will redirect here instead of rendering
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
        // res.redirect(303, "tapaaminen/peruta/onnistuminen");
        res.status(201).render("cancellationSuccess", { cancelledAppointment });

        // Adding background jobs to their respective queues
        await addJobsToQueue(
          userCancellationEmailQueue,
          "user-cancellation-email",
          {
            ...cancelledAppointment,
            reason: validatedBody.reason
          } as ICancelledAppointment
        );

        await addJobsToQueue(
          adminCancellationEmailQueue,
          "admin-cancellation-email",
          {
            ...cancelledAppointment,
            reason: validatedBody.reason
          } as ICancelledAppointment
        );
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

// Appointment cancellation success route handler
appointmentRouter.get(
  "/peruta/onnistuminen",
  (_req: Request, res: Response) => {
    res.status(200).render("cancellationSuccess");
  }
);

// Appointment booking success route handler
appointmentRouter.get("/aika/onnistuminnen", (_req: Request, res: Response) => {
  res.status(200).render("appointmentSuccess");
});

export default appointmentRouter;
