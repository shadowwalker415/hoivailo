import express from "express";
import cors from "cors";
import availabilityRouter from "./controller/availability";
import appointmentRouter from "./controller/appointment";
import contactRouter from "./controller/contact";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/availability", availabilityRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/contact-us", contactRouter);

export default app;
