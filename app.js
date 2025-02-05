const express = require('express');
const app = express();
const { sequelize } = require('./config/db'); // Sequelize instance
const healthz = require("./routes/healthz");


sequelize.sync();

app.use("/healthz", healthz);
app.use("*", (_, res) => {
    res.status(404).send();
});

module.exports = app;