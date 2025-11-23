import { Router, IRouter, Request, Response } from "express";
import { validateContactBody } from "../utils/parsers";
import ValidationError from "../errors/validationError";
import { addJobsToQueue } from "../utils/redisHelpers";
import { messageRequestQueue } from "../jobs/queues/queques";

const contactRouter: IRouter = Router();

contactRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).render("contactUs");
});

contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    const validatedReqBody = validateContactBody(req.body);

    // We will redirect here instead of rendering here, to prevent form resubmition.
    res.status(201).render("contactSuccess");

    // Adding a message request job to the message request queue
    // await messageRequestQueue.add("message-request", validatedReqBody);
    (async () =>
      addJobsToQueue(
        messageRequestQueue,
        "message-request",
        validatedReqBody
      ))();
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new ValidationError(err);
    } else {
      throw new Error("An unknown error occured");
    }
  }
});

export default contactRouter;
