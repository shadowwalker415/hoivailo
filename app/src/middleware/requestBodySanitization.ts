import { Response, NextFunction } from "express";
import { CustomRequest, IAppointmentCancel, IServiceInquiry } from "../types";
import xss from "xss";
import { IAppointment } from "../model/appointment";

const stripHTML = (value: string): string => {
  return xss(value, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"]
  });
};
// Middleware function to prevent NoSQL injections
export const sanitizeRequestBody = (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  // Checking if request body is that of appointment booking.
  if ("startTime" in req.body && "endTime" in req.body) {
    const sanitized: IAppointment = {
      ...req.body,
      name: stripHTML(req.body.name),
      email: stripHTML(req.body.email),
      phone: stripHTML(req.body.phone),
      notes: stripHTML(req.body.notes)
    };
    req.sanitizedBody = sanitized;
    // Checking if request body is that of appointment cancelation.
  } else if ("appointmentId" in req.body && "reason" in req.body) {
    console.log("Without sanitization");
    console.log(req.body);
    const sanitized: IAppointmentCancel = {
      appointmentId: stripHTML(req.body.appointmentId),
      reason: stripHTML(req.body.reason)
    };
    req.sanitizedBody = sanitized;
    // Checking if request body is that service inquiry.
  } else if ("message" in req.body) {
    const sanitized: IServiceInquiry = {
      name: stripHTML(req.body.name),
      phone: stripHTML(req.body.phone),
      email: stripHTML(req.body.email),
      message: stripHTML(req.body.message)
    };
    req.sanitizedBody = sanitized;
  }
  next();
};
