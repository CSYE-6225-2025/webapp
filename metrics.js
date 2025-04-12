const AWS = require("aws-sdk");
const SDC = require("statsd-client");
const db = require("./config/db"); // Your Sequelize config

// Configure AWS SDK
AWS.config.update({ region: process.env.AWS_REGION || "us-east-1" }); // Default to us-east-1 if not set
AWS.config.getCredentials((err) => {
  if (err) console.error("AWS credentials error:", err);
  else console.log("AWS credentials loaded successfully");
});

// Initialize CloudWatch and StatsD clients
const cloudwatch = new AWS.CloudWatch();
const sdc = new SDC({ host: "localhost", port: 8125 });

// Record API metrics (call count and response time)
const recordAPIMetrics = (apiName, duration, statusCode) => {
  const params = {
    MetricData: [
      {
        MetricName: "APICallCount",
        Dimensions: [
          { Name: "API", Value: apiName },
          { Name: "StatusCode", Value: statusCode.toString() },
        ],
        Unit: "Count",
        Value: 1,
      },
      {
        MetricName: "APIResponseTime",
        Dimensions: [{ Name: "API", Value: apiName }],
        Unit: "Milliseconds",
        Value: duration,
      },
    ],
    Namespace: "WebApp",
  };

  cloudwatch.putMetricData(params, (err) => {
    if (err) console.error(`CloudWatch error for ${apiName}:`, err);
    else console.log(`CloudWatch metrics sent for ${apiName}`);
  });

  sdc.increment(`api.${apiName}.count`);
  sdc.timing(`api.${apiName}.response_time`, duration);
  console.log(
    `StatsD: api.${apiName}.count incremented, response_time: ${duration}ms`
  );
};

// Record database query time
const recordDBQueryTime = (query, duration) => {
  if (isNaN(duration) || duration < 0) {
    console.error(`Invalid duration (${duration}) for query: ${query}`);
    return;
  }

  const params = {
    MetricData: [
      {
        MetricName: "DBQueryTime",
        Dimensions: [{ Name: "QueryType", Value: query }],
        Unit: "Milliseconds",
        Value: duration,
      },
    ],
    Namespace: "WebApp",
  };

  cloudwatch.putMetricData(params, (err) => {
    if (err) console.error(`CloudWatch DB error for ${query}:`, err);
    else console.log(`CloudWatch DB metrics sent for ${query}`);
  });

  sdc.timing(`db.query_time.${query}`, duration);
  console.log(`DB Query: ${query}, Duration: ${duration}ms`);
};

// Record S3 operation time
const recordS3Time = (operation, duration) => {
  if (isNaN(duration) || duration < 0) {
    console.error(`Invalid duration (${duration}) for S3 operation: ${operation}`);
    return;
  }

  const params = {
    MetricData: [
      {
        MetricName: "S3OperationTime",
        Dimensions: [{ Name: "Operation", Value: operation }],
        Unit: "Milliseconds",
        Value: duration,
      },
    ],
    Namespace: "WebApp",
  };

  cloudwatch.putMetricData(params, (err) => {
    if (err) console.error(`CloudWatch S3 error for ${operation}:`, err);
    else console.log(`CloudWatch S3 metrics sent for ${operation}`);
  });

  sdc.timing(`s3.${operation}.time`, duration);
  console.log(`S3 Operation: ${operation}, Duration: ${duration}ms`);
};

// Sequelize hooks for DB timing
db.sequelize.addHook("beforeQuery", (options, query) => {
  console.log(`beforeQuery triggered - SQL: ${options.sql || query?.sql || "unknown"}`); // Debug log
  options.startTime = Date.now();
});

db.sequelize.addHook("afterQuery", (result, options) => {
  console.log(`afterQuery triggered - SQL: ${options.sql || "unknown"}`); // Debug log

  // Skip internal queries like SHOW, DESCRIBE, etc.
  if (options.sql && options.sql.toUpperCase().match(/^(SHOW|DESCRIBE|EXPLAIN|SET)/)) {
    console.log(`Skipping metrics for internal query: ${options.sql}`);
    return;
  }

  if (!options.startTime) {
    console.error(
      `Missing startTime for DB query - SQL: ${options.sql || "unknown"}, Type: ${options.type || "unknown"}`
    );
    return;
  }

  const duration = Date.now() - options.startTime;
  if (isNaN(duration) || duration < 0) {
    console.error(
      `Invalid duration (${duration}) for query - SQL: ${options.sql || options.type || "unknown"}`
    );
    return;
  }

  // Sanitize query identifier to avoid invalid metric names
  const queryIdentifier = (options.type || options.sql || "unknown")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);
  recordDBQueryTime(queryIdentifier, duration);
});

// Middleware for API timing
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const apiName = req.route ? `${req.method}_${req.route.path}` : "unknown";
    recordAPIMetrics(apiName, duration, res.statusCode);
  });
  next();
};

module.exports = {
  recordAPIMetrics,
  recordDBQueryTime,
  recordS3Time,
  metricsMiddleware,
};