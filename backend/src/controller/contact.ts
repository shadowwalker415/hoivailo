import { Router, IRouter, Request, Response, NextFunction } from "express";
import { sendContactNotificationEmail } from "../services/emailService";
import { validateContactBody } from "../utils/parsers";
import { isEmailSent } from "../utils/helpers";
import CustomError from "../errors/customError";
import ValidationError from "../errors/validationError";

const contactRouter: IRouter = Router();

contactRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parsing and validating request body fields
      const validatedReqBody = validateContactBody(req.body);
      // Sending contact notification email to admin
      const response = await sendContactNotificationEmail(validatedReqBody);
      if (!isEmailSent(response)) {
        res.status(400).send({
          success: false,
          message:
            "Sorry couldn't deliver your message. Please try again later "
        });
      } else {
        res
          .status(200)
          .json({ success: true, message: `Message delivered to admin` });
      }
    } catch (err: unknown) {
      if (err instanceof CustomError || err instanceof ValidationError) {
        res.status(400).json({
          success: false,
          status: err.statusCode,
          message: err.message
        });
      } else {
        next();
      }
    }
  }
);

export default contactRouter;
