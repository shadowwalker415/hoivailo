import mongoSanitize from "express-mongo-sanitize";
import { Request, Response, NextFunction } from "express";

// Middleware function to prevent NoSQL injections
export const sanitizeParameters = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body); // Removing prohibited characters from request body fields
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params); // Removing prohibited characters from the request parameters
  }
  next();
};
