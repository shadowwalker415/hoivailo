import { Router, IRouter, Request, Response } from "express";
import { validateRequestBody } from "../utils/requestBodyParser";
import appointmentService from "../services/appointmentService";
import emailService from "../services/emailService";
import { IAppointment } from "../types";
// import { IAppointment } from "../types";

const appointmentRouter: IRouter = Router();

appointmentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const requestedAppointment = validateRequestBody(req.body);
    const savedAppointment = await appointmentService.createNewAppointment(
      requestedAppointment
    );
    if (savedAppointment instanceof Error)
      throw new Error(savedAppointment.message);

    const sentUserEmail = await emailService.sendUserConfirmationEmail(
      savedAppointment as IAppointment
    );
    if (!sentUserEmail) throw new Error("Failed to send email");
    const confirmedAppointment = await appointmentService.confirmUserEmail(
      savedAppointment as IAppointment
    );
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

export default appointmentRouter;
