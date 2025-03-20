const AWS = require('aws-sdk');

// AWS S3 configuration
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

module.exports = s3;