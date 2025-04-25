import express from "express";
import cors from "cors";
import availabilityRouter from "./controller/availability";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/availability", availabilityRouter);

export default app;
