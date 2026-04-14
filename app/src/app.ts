import express from "express";
import path from "path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import appointmentRouter from "./controller/appointment";
import contactRouter from "./controller/contact";
import servicesRouter from "./controller/services";
import homeRouter from "./controller/home";
import {
  unknownEndPoint,
  generalErrorHandler,
  databaseErrorHandler
} from "./middleware/errorHandler";

const app = express();
app.set("view engine", "pug"); // Setting pug as our rendering template engine.
app.set("views", path.join(__dirname, "views"));
app.use(helmet()); // Adding security to HTTP request headers.

// Configurations for HTTP request rate limiting. This will be later moved to config.ts file
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

app.use(
  express.urlencoded({
    extended: true,
    inflate: true,
    limit: "1mb",
    parameterLimit: 5000,
    type: "application/x-www-form-urlencoded"
  })
); // Parsing form submition data

app.use(
  hpp({
    whitelist: ["date"]
  })
); // Preventing HTTP parameter pollution.

app.use("/public", express.static(path.join(__dirname, "public"))); // Serving static files
// app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // Serving images or videos

app.use("/", homeRouter);
app.use("/palvelu", servicesRouter);
app.use("/tapaaminen", appointmentRouter);
app.use("/yhteistiedot", contactRouter);
app.use(databaseErrorHandler);
app.use(generalErrorHandler);
app.use(unknownEndPoint);

export default app;
