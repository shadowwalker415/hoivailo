import { Router, IRouter, Request, Response } from "express";
import { validateRequestBody } from "../utils/requestBodyParser";
import Appointment from "../model/appointment";

const appointmentRouter: IRouter = Router();

appointmentRouter.post("/", async (req: Request, res: Response) => {
  try {
    const reqAppointment = validateRequestBody(req.body);
    const appointmentObj = new Appointment(reqAppointment);
    const savedAppointment = await appointmentObj.save();
    if (savedAppointment) {
      res.status(201).json({ data: savedAppointment });
    }
  } catch (err: unknown) {
    let error;
    if (err instanceof Error) error = err;
    res.status(400).json({ error: error?.message });
  }
});

export default appointmentRouter;
