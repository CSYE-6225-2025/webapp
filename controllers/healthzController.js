const { testDbConnection } = require("../config/db");
const HealthzCheck = require("../model/healthz");
const logger = require("../logger");

const healthCheck = async (_, res) => {
  const startTime = Date.now();
  logger.info("GET /healthz - Health check initiated");

  try {
    // Test DB connection with timing
    const dbConnStart = Date.now();
    const dbConnection = await testDbConnection();
    logger.info(`DB Connection Test Time: ${Date.now() - dbConnStart}ms`);

    if (!dbConnection) {
      logger.error("Database connection test failed");
      return res.status(503).send();
    }

    // DB Insert with timing
    const dbInsertStart = Date.now();
    await HealthzCheck.create({
      datetime: new Date().toISOString(),
    });
    logger.info(`DB Insert Time: ${Date.now() - dbInsertStart}ms`);

    logger.info(
      `GET /healthz - Health check completed successfully in ${
        Date.now() - startTime
      }ms`
    );
    return res.status(200).send();
  } catch (error) {
    logger.error(`Health check failed after ${Date.now() - startTime}ms`, {
      error: error.message,
      stack: error.stack,
    });
    return res.status(503).send();
  }
};

module.exports = { healthCheck };
