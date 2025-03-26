const File = require("../model/fileModel");
const S3Service = require("../services/s3Service");
const logger = require("../logger");

class FileController {
  // Upload a file
  static async uploadFile(req, res) {
    const startTime = Date.now();
    logger.info("POST /files - Upload request initiated");

    try {
      if (!req.file) {
        logger.warn("No file uploaded - returning 400");
        return res.status(400).json({ message: "No file uploaded" });
      }

      logger.debug("File upload validation passed", {
        fileName: req.file.originalname,
        size: req.file.size,
      });

      // S3 Upload with timing
      const s3Start = Date.now();
      const s3Response = await S3Service.uploadFile(req.file);
      logger.info(`S3 Upload Time: ${Date.now() - s3Start}ms`, {
        fileKey: s3Response.s3_key,
        size: req.file.size,
      });

      // DB Insert with timing
      const dbStart = Date.now();
      const file = await File.create({
        file_name: req.file.originalname,
        url: s3Response.url,
        etag: s3Response.etag,
        content_type: s3Response.content_type,
        content_length: s3Response.content_length,
        last_modified: s3Response.last_modified,
        s3_key: s3Response.s3_key,
      });
      logger.info(`DB Insert Time: ${Date.now() - dbStart}ms`, {
        fileId: file.id,
      });

      // Format response
      const uploadDate =
        file.upload_date instanceof Date
          ? file.upload_date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

      logger.info(
        `POST /files - Request completed successfully in ${
          Date.now() - startTime
        }ms`
      );
      res.status(201).json({
        file_name: file.file_name,
        id: file.id,
        url: file.url,
        upload_date: uploadDate,
      });
    } catch (error) {
      logger.error(`Upload failed after ${Date.now() - startTime}ms`, {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        message: "Error uploading file",
        error: error.message,
      });
    }
  }

  // Get file metadata
  static async getFile(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    logger.info(`GET /files/${id} - Fetch request initiated`);

    try {
      // DB Query with timing
      const dbStart = Date.now();
      const file = await File.findByPk(id);
      logger.info(`DB Query Time: ${Date.now() - dbStart}ms`, {
        fileId: id,
      });

      if (!file) {
        logger.warn(`File not found - ID: ${id}`);
        return res.status(404).json({ message: "File not found" });
      }

      logger.info(
        `GET /files/${id} - Request completed successfully in ${
          Date.now() - startTime
        }ms`
      );
      res.status(200).json({
        file_name: file.file_name,
        id: file.id,
        url: file.url,
        upload_date: file.upload_date.toISOString().split("T")[0],
      });
    } catch (error) {
      logger.error(`File fetch failed after ${Date.now() - startTime}ms`, {
        fileId: id,
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        message: "Error retrieving file",
        error: error.message,
      });
    }
  }

  // Delete a file
  static async deleteFile(req, res) {
    const startTime = Date.now();
    const { id } = req.params;
    logger.info(`DELETE /files/${id} - Delete request initiated`);

    try {
      // DB Query with timing
      const dbQueryStart = Date.now();
      const file = await File.findByPk(id);
      logger.info(`DB Query Time: ${Date.now() - dbQueryStart}ms`, {
        fileId: id,
      });

      if (!file) {
        logger.warn(`File not found for deletion - ID: ${id}`);
        return res.status(404).json({ message: "File not found" });
      }

      // S3 Deletion with timing
      const s3Start = Date.now();
      await S3Service.deleteFile(file.url);
      logger.info(`S3 Deletion Time: ${Date.now() - s3Start}ms`, {
        fileKey: file.s3_key,
      });

      // DB Deletion with timing
      const dbDeleteStart = Date.now();
      await file.destroy();
      logger.info(`DB Delete Time: ${Date.now() - dbDeleteStart}ms`, {
        fileId: id,
      });

      logger.info(
        `DELETE /files/${id} - Request completed successfully in ${
          Date.now() - startTime
        }ms`
      );
      res.status(204).send();
    } catch (error) {
      logger.error(`File deletion failed after ${Date.now() - startTime}ms`, {
        fileId: id,
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        message: "Error deleting file",
        error: error.message,
      });
    }
  }
}

module.exports = FileController;
