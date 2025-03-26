const AWS = require('aws-sdk');
const SDC = require('statsd-client');
const db = require('./config/db'); // Your Sequelize config

// Configure AWS SDK
AWS.config.update({ region: process.env.AWS_REGION });

// Initialize CloudWatch and StatsD client
const cloudwatch = new AWS.CloudWatch();
const sdc = new SDC({ host: 'localhost', port: 8125 });

const recordAPIMetrics = (apiName, duration, statusCode) => {
  const params = {
    MetricData: [
      {
        MetricName: 'APICallCount',
        Dimensions: [
          { Name: 'API', Value: apiName },
          { Name: 'StatusCode', Value: statusCode.toString() }
        ],
        Unit: 'Count',
        Value: 1
      },
      {
        MetricName: 'APIResponseTime',
        Dimensions: [
          { Name: 'API', Value: apiName }
        ],
        Unit: 'Milliseconds',
        Value: duration
      }
    ],
    Namespace: 'WebApp'
  };

  // Send to CloudWatch
  cloudwatch.putMetricData(params, (err) => {
    if (err) console.error('Error sending metrics:', err);
  });

  // Also send to StatsD
  sdc.increment(`api.${apiName}.count`);
  sdc.timing(`api.${apiName}}.response_time`, duration);
};

const recordDBQueryTime = (query, duration) => {
  sdc.timing('db.query_time', duration);
  // You can also send to CloudWatch similarly
};

const recordS3Time = (operation, duration) => {
  sdc.timing(`s3.${operation}.time`, duration);
  // You can also send to CloudWatch similarly
};

// Sequelize query timing
db.sequelize.addHook('beforeQuery', (options) => {
  options.startTime = Date.now();
});

db.sequelize.addHook('afterQuery', (result, options) => {
  const duration = Date.now() - options.startTime;
  recordDBQueryTime(options.type || 'unknown', duration);
});

module.exports = {
  recordAPIMetrics,
  recordDBQueryTime,
  recordS3Time,
  middleware: (req, res, next) => {
    req.startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - req.startTime;
      const apiName = req.route ? `${req.method}_${req.route.path}` : 'unknown';
      recordAPIMetrics(apiName, duration, res.statusCode);
    });
    next();
  }
};