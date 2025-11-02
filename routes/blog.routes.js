// routes/blog.routes.js
const express = require("express");
const router = express.Router();
const blogController = require("../src/controllers/blog.controller");
const authMiddleware = require("../middleware/auth.middleware");
// NOTE: We'll reuse the multer middleware, but only look for 'featured_image' field
const {
  multerMiddleware,
  cloudinaryMiddleware,
} = require("../middleware/upload.middleware");

// GET /api/v1/blog/articles (Public: List all articles)
router.get("/articles", blogController.getArticles);

// GET /api/v1/blog/articles/:id (Public: Get single article details)
router.get("/articles/:id", blogController.getArticle);

// POST /api/v1/blog/articles (Requires Admin access for creation)
router.post(
  "/articles",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  // NOTE: You must update the multerMiddleware to handle the key 'featured_image'
  multerMiddleware,
  // NOTE: You must update cloudinaryMiddleware to map URL to 'featured_image_url'
  cloudinaryMiddleware,
  blogController.createBlogArticle
);

// --- PATCH /api/v1/blog/articles/:id (Update Article) ---
router.patch(
  "/articles/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  // Reuse file upload middleware in case a new featured image is being uploaded
  multerMiddleware,
  cloudinaryMiddleware,
  blogController.updateBlogArticle
);

// --- DELETE /api/v1/blog/articles/:id (Soft Delete Article) ---
router.delete(
  "/articles/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  blogController.deleteBlogArticle
);

module.exports = router;
