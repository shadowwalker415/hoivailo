import { Router, IRouter, Request, Response, NextFunction } from "express";
import {
  isIServiceInquiry,
  validateServiceInquiryBody
} from "../utils/parsers";
import ValidationError from "../errors/validationError";
import { sanitizeRequestBody } from "../middleware/requestBodySanitization";
import { CustomRequest } from "../types";
// import { SERVICE_INQUIRY_QUEUE } from "../queues/service-inquiry.queue";
// import { getQueue } from "../queues/registry";
const contactRouter: IRouter = Router();

contactRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).render("contactUs");
});

contactRouter.post(
  "/",
  sanitizeRequestBody,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const validationResult = validateServiceInquiryBody(req.sanitizedBody);

      if (!isIServiceInquiry(validationResult)) {
        res.status(200).render("contactUs", {
          formErrors: validationResult,
          fieldValues: req.body
        });
      } else {
        // We will redirect here instead of rendering here, to prevent form resubmition.
        res.status(201).render("contactSuccess");

        // Adding a message request job to the message request queue
        // getQueue(SERVICE_INQUIRY_QUEUE).add(
        //   "service-inquiry",
        //   serviceInquiryDetails
        // );
      }
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        next(err);
      } else {
        next(new Error("An unknown error occured. Check error stack trace."));
      }
    }
  }
);

export default contactRouter;
