const s3 = require("../config/aws.config");
const { v4: uuidv4 } = require("uuid");

class S3Service {
  // Upload a file to S3
  static async uploadFile(file) {
    const fileExtension = file.originalname.split(".").pop(); // Get file extension
    const s3Key = `${uuidv4()}.${fileExtension}`; // Unique key for S3

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const s3Response = await s3.upload(params).promise();

    // Return the full S3 URL
    // Return the S3 response object with metadata
    return {
      url: s3Response.Location, // S3 file URL
      etag: s3Response.ETag, // S3 ETag
      content_type: s3Response.ContentType, // File content type
      content_length: file.size, // File size in bytes (from the file object)
      last_modified: s3Response.LastModified, // Last modified date from S3
      s3_key: s3Key, // S3 object key
    };
  }

  // Delete a file from S3
  static async deleteFile(url) {
    const s3Key = url.split(".amazonaws.com/")[1]; // Extract S3 key from URL
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };

    await s3.deleteObject(params).promise();
  }
}

module.exports = S3Service;
