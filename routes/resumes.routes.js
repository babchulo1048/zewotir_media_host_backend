// routes/resumes.routes.js
const express = require("express");
const router = express.Router();
const resumeController = require("../src/controllers/resume.controller");
const authMiddleware = require("../middleware/auth.middleware");
const uploadMiddleware = require("../middleware/upload.middleware");

// POST /api/v1/resumes (Upload new resume)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin, // Assuming ADMIN access is required
  // Multer handles file limits and document type check (field name: 'document')
  uploadMiddleware.multerMiddleware,
  // Cloudinary uploads the document as 'raw' resource type
  uploadMiddleware.cloudinaryMiddleware,
  resumeController.createResume
);

// GET /api/v1/resumes (Get all resumes)
router.get("/", resumeController.getAllResumes);

// DELETE /api/v1/resumes/:id
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  resumeController.deleteResume
);

module.exports = router;
