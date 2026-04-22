import winston from "winston";

// Creating custom levels
const customLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: "red bold",
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue"
  }
};

// Adding colors to Winston logging.
winston.addColors(customLevels.colors);

export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
    })
  ]
});

export default logger;
