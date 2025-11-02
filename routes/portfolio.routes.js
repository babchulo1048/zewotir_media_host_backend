// routes/portfolio.routes.js
const express = require("express");
const router = express.Router();
const portfolioController = require("../src/controllers/portfolio.controller");
const authMiddleware = require("../middleware/auth.middleware");
const uploadMiddleware = require("../middleware/upload.middleware"); // <--- NEW

// GET /api/v1/portfolio/assets/media (Public access)
router.get("/assets/:type", portfolioController.getAssetsByType);

// POST /api/v1/portfolio/assets (Requires Admin access AND file upload handling)
router.post(
  "/assets",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  uploadMiddleware.multerMiddleware, // <--- NEW: Multer handles the 'thumbnail' file
  uploadMiddleware.cloudinaryMiddleware, // <--- NEW: Cloudinary uploads the file
  portfolioController.createPortfolioAsset
);

// --- PATCH /api/v1/portfolio/assets/:id (Update Asset) ---
router.patch(
  "/assets/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  // Reuse file upload middleware in case a new file (image/audio) is being uploaded
  uploadMiddleware.multerMiddleware,
  uploadMiddleware.cloudinaryMiddleware,
  portfolioController.updatePortfolioAsset
);

// --- DELETE /api/v1/portfolio/assets/:id (Soft Delete Asset) ---
router.delete(
  "/assets/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  portfolioController.deletePortfolioAsset
);

module.exports = router;

module.exports = router;
