const express = require("express");
const multer = require("multer");
const FileController = require("../controllers/fileController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory for processing

// Allowed methods for the file API
const allowedMethods = ["GET", "POST", "DELETE"];

// Middleware for error handling
router.use(express.json(), (req, res, next) => {
  // Disallow request bodies for GET and DELETE methods
  if (
    (req.method === "GET" || req.method === "DELETE") &&
    Object.keys(req.body).length > 0
  ) {
    return res.status(400).send(); // Bad Request
  }

  // Disallow query parameters
  if (Object.keys(req.query).length > 0) {
    return res.status(400).send(); // Bad Request
  }

  // Restrict allowed methods
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).send(); // Method Not Allowed
  }

  // Set headers
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  next();
});

// POST /v1/file - Upload a file
router.post(
  "/file",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send(); // Multer error (e.g., wrong field name)
      } else if (err) {
        return res.status(500).send(); // Internal server error
      }
      next();
    });
  },
  FileController.uploadFile
);
// GET /v1/file/:id - Get file metadata
router.get("/file/:id", FileController.getFile);

// DELETE /v1/file/:id - Delete a file
router.delete("/file/:id", FileController.deleteFile);

module.exports = router;
