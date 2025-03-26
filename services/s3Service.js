const s3 = require("../config/aws.config");
const { v4: uuidv4 } = require("uuid");
const { recordS3Time } = require("../metrics");

class S3Service {
  // Upload a file to S3
  static async uploadFile(file) {
    const startTime = Date.now();
    const fileExtension = file.originalname.split(".").pop();
    const s3Key = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const s3Response = await s3.upload(params).promise();
      const duration = Date.now() - startTime;
      
      // Record successful upload metrics
      recordS3Time('upload', duration);
      
      return {
        url: s3Response.Location,
        etag: s3Response.ETag,
        content_type: s3Response.ContentType,
        content_length: file.size,
        last_modified: s3Response.LastModified,
        s3_key: s3Key,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed upload metrics
      recordS3Time('upload_error', duration);
      throw error;
    }
  }

  // Delete a file from S3
  static async deleteFile(url) {
    const startTime = Date.now();
    const s3Key = url.split(".amazonaws.com/")[1];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    try {
      await s3.deleteObject(params).promise();
      const duration = Date.now() - startTime;
      
      // Record successful delete metrics
      recordS3Time('delete', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed delete metrics
      recordS3Time('delete_error', duration);
      throw error;
    }
  }

  // Get file metadata from S3
  static async getFileMetadata(url) {
    const startTime = Date.now();
    const s3Key = url.split(".amazonaws.com/")[1];

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    try {
      const headObject = await s3.headObject(params).promise();
      const duration = Date.now() - startTime;
      
      // Record successful metadata fetch
      recordS3Time('metadata', duration);
      
      return {
        content_type: headObject.ContentType,
        content_length: headObject.ContentLength,
        last_modified: headObject.LastModified,
        etag: headObject.ETag,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failed metadata fetch
      recordS3Time('metadata_error', duration);
      throw error;
    }
  }
}

module.exports = S3Service;