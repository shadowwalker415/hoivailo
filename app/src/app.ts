import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { sanitizeParameters } from "./middleware/parameterSanitizer";
import morgan from "morgan";
import availabilityRouter from "./controller/availability";
import appointmentRouter from "./controller/appointment";
import contactRouter from "./controller/contact";
import {
  unknownEndPoint,
  generalErrorHandler,
  databaseErrorHandler
} from "./middleware/errorHandler";

const app = express();
app.use(helmet()); // Adding security to HTTP request headers.

// Configurations for HTTP request rate limiting.
const limiter = rateLimit({
  max: 100, //Max 100 request
  windowMs: 60 * 60 * 1000, // 1hr
  message: "Too many request from this IP. Please try again in an hour"
});
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api", limiter); // Setting a request rate limit on all /api routes.

app.use(express.json());

app.use(sanitizeParameters); // Preventing NoSQL injections

app.use(
  hpp({
    whitelist: ["date"]
  })
); // Preventing HTTP parameter pollution.

app.use("/api/v1/availability", availabilityRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/contact-us", contactRouter);
app.use(databaseErrorHandler);
app.use(generalErrorHandler);
app.use(unknownEndPoint);

export default app;
