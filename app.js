const express = require("express");
const app = express();
const { sequelize } = require("./config/db"); // Sequelize instance
const healthz = require("./routes/healthz");
const fileRoutes = require("./routes/fileRoutes");

sequelize.sync();

// Middleware
app.use(express.json());

// Routes
app.use("/healthz", healthz);
app.use("/v1", fileRoutes); // File-related routes

// Error handling for undefined routes
app.use("*", (_, res) => {
  res.status(404).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
