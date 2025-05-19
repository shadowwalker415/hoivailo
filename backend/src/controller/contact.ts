import { Router, IRouter, Request, Response } from "express";
import emailService from "../services/emailService";
import { validateContactBody } from "../utils/parsers";
import helpers from "../utils/helpers";

const contactRouter: IRouter = Router();

contactRouter.post("/", async (req: Request, res: Response) => {
  try {
    // Parsing and validating request body fields
    const validatedReqBody = validateContactBody(req.body);
    // Sending contact notification email to admin
    const response = await emailService.sendContactNotificationEmail(
      validatedReqBody
    );
    if (!helpers.isEmailSent(response)) {
      res.status(400).send({
        success: false,
        message: "Sorry couldn't deliver your message. Please try again later "
      });
    } else {
      res
        .status(200)
        .json({ success: true, message: `Message delivered to admin` });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({
        success: false,
        message:
          "Sorry, we couldn't deliver your message. Please try again later."
      });
    }
  }
});

export default contactRouter;
