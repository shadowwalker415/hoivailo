import { Router, IRouter, Request, Response, NextFunction } from "express";
import {
  isIAppoinmentCancel,
  isIAppointment,
  validateAppointmentCancellationBody,
  validateAppointmentRequestBody
} from "../utils/parsers";
import {
  createNewAppointment,
  cancelAppointment
} from "../services/appointments";
import { CustomRequest } from "../types";
import { getAppointmentDate } from "../middleware/availableSlotDate";
import {
  isPastDate,
  isWorkingDay,
  getCurrentDate,
  getDateOfficial,
  getDifferenceInMonths,
  convertDateStringFromISO8601
} from "../utils/helpers";
import { generateAvailableSlots } from "../services/appointments";
import ValidationError from "../errors/validationError";
import InternalServerError from "../errors/internalServerError";
import EntityNotFoundError from "../errors/entityNotFoundError";
import { sanitizeRequestBody } from "../middleware/requestBodySanitization";
import { getQueue } from "../queues/registry";
import { APPOINTMENT_BOOKED_QUEUE } from "../queues/appointment-booked.queue";
// import { APPOINTMENT_CANCELLED_QUEUE } from "../queues/appointment-cancelled.queue";
// import { ICancelledAppointment } from "../model/appointment";

const appointmentRouter: IRouter = Router();

// Appointment cancelation route
appointmentRouter.get("/peruta", (_req: Request, res: Response) => {
  res.status(200).render("cancelAppointment");
});

// Available appointment slot date selection route
appointmentRouter.get("/valitse-paivamaara", (_req: Request, res: Response) => {
  res.status(200).render("selectDate");
});

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

// Appointment available slots route handler
appointmentRouter.get(
  "/oleva-aika",
  getAppointmentDate,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Checking if the request has a query parameter.
      if (!req.appointmentSlotDate) {
        throw new ValidationError({
          message: "Appointment date is required",
          statusCode: 400,
          code: "VALIDATION_ERROR"
        });
      }

      // Checking if requested date is a previous date.
      if (isPastDate(req.appointmentSlotDate)) {
        res.status(200).render("noSlotsFound");
        // Checking if requested date is a working day.
      } else if (!isWorkingDay(req.appointmentSlotDate)) {
        res.status(200).render("noSlotsFound");
        // Checking if requested date is the current date.
      } else if (
        getCurrentDate() === getDateOfficial(new Date(req.appointmentSlotDate))
      ) {
        res.status(200).render("noSlotsFound");
        // Checking if requested date is more than 3 months away.
      } else if (
        getDifferenceInMonths(new Date(req.appointmentSlotDate)) >= 3
      ) {
        res.status(200).render("noSlotsFound");
      } else {
        const availableSlots = await generateAvailableSlots(
          req.appointmentSlotDate
        );
        // Checking if the slot generation operation failed due to
        // maybe an error with database query.
        if (availableSlots instanceof Error) {
          throw new InternalServerError({
            message: availableSlots.message,
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR"
          });
        }
        // Checking if all slots are booked for selected date
        if (availableSlots.length < 1) {
          res.status(200).render("noSlotsFound");
        } else {
          res.status(200).render("appointment", { availableSlots });
        }
      }
    } catch (err: unknown) {
      if (
        err instanceof Error ||
        err instanceof ValidationError ||
        err instanceof InternalServerError
      ) {
        next(err);
      } else {
        next(new Error("An unknown error occured"));
      }
    }
  }
);

// Route handler for booking appointments
appointmentRouter.post(
  "/aika",
  sanitizeRequestBody,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const validationResult = validateAppointmentRequestBody(
        req.sanitizedBody
      );

      // Checking if validation had field errors
      if (!isIAppointment(validationResult)) {
        const appointmentDate = convertDateStringFromISO8601(
          req.body.startTime
        );
        // Regenerating available slots
        const availableSlots = await generateAvailableSlots(appointmentDate);

        // Checking if database read operation failed.
        if (
          availableSlots instanceof Error ||
          availableSlots instanceof InternalServerError
        ) {
          throw new Error(availableSlots.message);
        }
        console.log(validationResult);
        res.status(200).render("appointment", {
          errorValues: validationResult,
          fieldValues: req.body,
          availableSlots
        });
      } else {
        const savedAppointment = await createNewAppointment(validationResult);
        if (
          savedAppointment instanceof Error ||
          savedAppointment instanceof InternalServerError
        ) {
          throw new InternalServerError({
            message: savedAppointment.message,
            statusCode: 500
          });
        } else {
          // Redirecting to appointment booked success page.
          res.redirect(303, "/tapaaminen/aika/onnistuminnen");

          // Adding email background job to queue.
          getQueue(APPOINTMENT_BOOKED_QUEUE).add(
            "appointment-booked",
            savedAppointment,
            {
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 1000 // Delay in milliseconds
              }
            }
          );
        }
      }
    } catch (err: unknown) {
      // Checking if request body was empty.
      if (
        err instanceof ValidationError &&
        err.message === "Empty request body"
      ) {
        // This is a place holder. We will render the same page with errors later.
        res.status(200).render("selectDate");
      } else {
        next(err);
      }
    }
  }
);

// Route handler for cancelling appointments
appointmentRouter.post(
  "/peruta",
  sanitizeRequestBody,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const validatedBody = validateAppointmentCancellationBody(
        req.sanitizedBody
      );

      if (!isIAppoinmentCancel(validatedBody)) {
        console.log(validatedBody);
        res.status(200).render("cancelAppointment", {
          errorValues: validatedBody,
          fieldValues: req.body
        });
      } else {
        // Cancelling appointment
        const cancelledAppointment = await cancelAppointment(
          validatedBody.appointmentId
        );

        if (
          cancelledAppointment instanceof EntityNotFoundError ||
          cancelledAppointment instanceof Error
        ) {
          throw new Error(cancelledAppointment.message);
        } else {
          // Redirecting to appointment cancelled success page.
          res.redirect(303, "/tapaaminen/peruta/onnistuminen");

          // const cancelledAppointmentData: ICancelledAppointment = {
          //   appointmentId: cancelledAppointment.appointmentId as string,
          //   startTime: cancelledAppointment.startTime,
          //   name: cancelledAppointment.name,
          //   service: cancelledAppointment.service,
          //   email: cancelledAppointment.email,
          //   phone: cancelledAppointment.phone,
          //   reason: validatedBody.reason ? validatedBody.reason : ""
          // };

          // Adding appointment cancelled email notification job to queue.
          // getQueue(APPOINTMENT_CANCELLED_QUEUE).add(
          //   "appointment-cancelled",
          //   cancelledAppointmentData,
          //   {
          //     attempts: 3,
          //     backoff: { type: "exponential", delay: 1000 }
          //   }
          // );
        }
      }
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        res.status(200).render("cancelAppointment", {
          errorValues: {
            id: "Appointment ID required",
            text: "Reason required"
          }
        });
      } else {
        next(err);
      }
    }
  }
);

export default appointmentRouter;
