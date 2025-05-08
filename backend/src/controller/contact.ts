import { Router, IRouter, Request, Response } from "express";
import emailService from "../services/emailService";
import { validateContactBody } from "../utils/parsers";

const contactRouter: IRouter = Router();

contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    const validatedReqBody = validateContactBody(req.body);
    // Sending contact notification email to admin
    await emailService.sendContactNotificationEmail(validatedReqBody);
    res.status(200).json({ message: `Email sent to admin` });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    }
  }
});

export default contactRouter;
