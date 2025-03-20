const File = require("../model/fileModel");
const S3Service = require("../services/s3Service");

class FileController {
  // Upload a file
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const s3Response = await S3Service.uploadFile(req.file);

      // Save file metadata to the database
      const file = await File.create({
        file_name: req.file.originalname,
        url: s3Response.url, // S3 file URL
        etag: s3Response.etag, // S3 ETag
        content_type: s3Response.content_type, // File content type
        content_length: s3Response.content_length, // File size in bytes
        last_modified: s3Response.last_modified, // Last modified date from S3
        s3_key: s3Response.s3_key, // S3 object key
      });

      // Safely format the upload_date
      const uploadDate =
        file.upload_date instanceof Date
          ? file.upload_date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

      // Return 201 Created response
      res.status(201).json({
        file_name: file.file_name,
        id: file.id,
        url: file.url,
        upload_date: uploadDate,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error uploading file", error: error.message });
    }
  }

  // Get file metadata
  static async getFile(req, res) {
    try {
      const { id } = req.params;
      const file = await File.findByPk(id);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.status(200).json({
        file_name: file.file_name,
        id: file.id,
        url: file.url,
        upload_date: file.upload_date.toISOString().split("T")[0],
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving file", error: error.message });
    }
  }

  // Delete a file
  static async deleteFile(req, res) {
    try {
      const { id } = req.params;
      const file = await File.findByPk(id);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Delete file from S3
      await S3Service.deleteFile(file.url);

      // Delete file metadata from the database
      await file.destroy();

      res.status(204).send(); // No content for successful deletion
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting file", error: error.message });
    }
  }
}

module.exports = FileController;
