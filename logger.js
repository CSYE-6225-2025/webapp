// logger.js
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, json } = format;
const fs = require("fs");
const path = require("path");

// Log directory - using the path from your cloud config
const logDir = "/opt/csye6225/webapp/logs";

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
  if (stack) {
    log += `\n${stack}`;
  }
  return log;
});

// Custom format for file output
const fileFormat = printf(({ level, message, timestamp, stack }) => {
  const log = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(stack && { stack }),
  };
  return JSON.stringify(log);
});

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true })
  ),
  transports: [
    // Console transport (colorized)
    new transports.Console({
      format: combine(colorize(), consoleFormat),
      handleExceptions: true,
    }),

    // File transport (JSON format)
    new transports.File({
      filename: path.join(logDir, "webapp.log"),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

// Add a stream for morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
