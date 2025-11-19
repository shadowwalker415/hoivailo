import { Router, IRouter, Request, Response } from "express";
import { validateContactBody } from "../utils/parsers";
import ValidationError from "../errors/validationError";
// import { contactAdmin } from "../tasks/contactAdmin";
import { messageRequestQueue } from "../jobs/queues/queques";

const contactRouter: IRouter = Router();

contactRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).render("contactUs");
});

contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    const validatedReqBody = validateContactBody(req.body);

    res.status(201).render("contactSuccess");

    // Adding a message request job to the message request queue
    messageRequestQueue.add("message-request", validatedReqBody);

    // Fire-and-forget Async  job with IIFE for admin email notification on new contact request.
    // (async () => contactAdmin(validatedReqBody))();
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new ValidationError(err);
    } else {
      throw new Error("An unknown error occured");
    }
  }
});

export default contactRouter;
