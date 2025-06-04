import { Router, IRouter, Request, Response } from "express";
import { validateContactBody } from "../utils/parsers";
import ValidationError from "../errors/validationError";
import { contactAdmin } from "../tasks/contactAdmin";

const contactRouter: IRouter = Router();

contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    const validatedReqBody = validateContactBody(req.body);
    // Sending contact notification email to admin
    // const response = await sendContactNotificationEmail(validatedReqBody);
    res.status(201).json({
      success: true,
      status: 201,
      data: {
        message: "Your message has been sent and we will reach out soon."
      }
    });
    // Async fire-and-forget with IIFE for admin email notification about new contact request.
    (async () => contactAdmin(validatedReqBody))();
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      throw new ValidationError(err);
    } else {
      throw new Error("An unknown error occured");
    }
  }
});

export default contactRouter;
