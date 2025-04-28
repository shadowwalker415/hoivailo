import express from "express";
import cors from "cors";
import availabilityRouter from "./controller/availability";
import appointmentRouter from "./controller/appointment";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/availability", availabilityRouter);
app.use("/api/v1/appointment", appointmentRouter);

export default app;
