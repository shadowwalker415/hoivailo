import { Router, IRouter, Request, Response } from "express";
import { validateContactBody } from "../utils/parsers";
import ValidationError from "../errors/validationError";
import { SERVICE_INQUIRY_QUEUE } from "../queues/service-inquiry.queue";
import { getQueue } from "../queues/registry";
const contactRouter: IRouter = Router();

contactRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).render("contactUs");
});

contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    validateContactBody(req.body);

    // We will redirect here instead of rendering here, to prevent form resubmition.
    res.status(201).render("contactSuccess");

    // Adding a message request job to the message request queue
    getQueue(SERVICE_INQUIRY_QUEUE).add("service-inquiry", validateContactBody);
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new ValidationError(err);
    } else {
      throw new Error("An unknown error occured");
    }
  }
});

export default contactRouter;
