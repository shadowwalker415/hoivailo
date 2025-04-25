import { Response, IRouter, Router } from "express";
import { CustomRequest } from "../types";
import { getAppointDate } from "../middleware/availability";
import dateHelper from "../utils/dateHelper";

const availabilityRouter: IRouter = Router();

availabilityRouter.get(
  "/",
  getAppointDate,
  async (req: CustomRequest, res: Response) => {
    try {
      // check if request availability date is a past date.
      if (dateHelper.isPastDate(req.availabilityDate as string)) {
        res.status(200).json({ slots: [] });
      } else {
        res.status(200).json({ message: "There are available slots" });
      }
      // check if request availability date is more than 2 months ahead.
    } catch (err) {
      res.status(401).json({ error: "Invalid date" });
    }
  }
);

export default availabilityRouter;
