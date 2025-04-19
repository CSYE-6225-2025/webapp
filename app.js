const express = require("express");
const app = express();
const { sequelize } = require("./config/db"); // Sequelize instance
const healthz = require("./routes/healthz");
const fileRoutes = require("./routes/fileRoutes");
const { metricsMiddleware } = require("./metrics");
const logger = require("./logger");
// Initialize metrics collection
app.use(metricsMiddleware);

sequelize.sync();

// Middleware
app.use(express.json());

// Routes
app.use("/healthz", healthz);
app.use("/cicd",healthz);
app.use("/v1", fileRoutes); // File-related routes

// Error handling for undefined routes
app.use("*", (_, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error occurred", {
    error: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
