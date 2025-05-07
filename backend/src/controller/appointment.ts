import { Router, IRouter, Request, Response } from "express";
import {
  validateAppointmentCancellationBody,
  validateAppointmentRequestBody
} from "../utils/parsers";
import appointmentService from "../services/appointmentService";
import emailService from "../services/emailService";
import { IAppointment } from "../types";

const appointmentRouter: IRouter = Router();

appointmentRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    const requestedAppointment = validateAppointmentRequestBody(req.body);

    // Creating a new appointment document on the database
    const savedAppointment = await appointmentService.createNewAppointment(
      requestedAppointment
    );
    if (savedAppointment instanceof Error)
      throw new Error(savedAppointment.message);

    // Sending appointment confirmation notification email to user
    const sentUserEmail = await emailService.sendUserConfirmationEmail(
      savedAppointment as IAppointment
    );
    if (!sentUserEmail) throw new Error("Failed to send email");
    //Confirming email notification has been sent to user
    const confirmedAppointment = await appointmentService.confirmUserEmail(
      savedAppointment as IAppointment
    );
    // Sending new appointment notification email to admin
    const sentAdminEmail = await emailService.sendAdminConfirmationEmail(
      confirmedAppointment as IAppointment
    );
    console.log(sentAdminEmail);

    res.status(200).json({
      message: `Email successfully sent to ${savedAppointment.email}`
    });
  } catch (err: unknown) {
    console.log("This is the error section");
    let error = undefined;
    if (err instanceof Error) error = err;
    res.status(400).json({ error: error?.message });
  }
});

appointmentRouter.post("/cancel", async (req: Request, res: Response) => {
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

    res.status(201).json({ message: "Appointment cancelled" });
  } catch (err: unknown) {
    let error = undefined;
    if (err instanceof Error) {
      error = err;
    }
    res.status(400).json({ error: error?.message });
  }
});

export default appointmentRouter;
