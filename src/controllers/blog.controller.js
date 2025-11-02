// src/controllers/blog.controller.js
const blogService = require("../../services/blog.service");

// --- 1. POST Article Controller (ADMIN) ---
const createBlogArticle = async (req, res) => {
  try {
    // The image URL will be in req.body.featured_image_url
    const newArticle = await blogService.createNewArticle(req.body);

    res.status(201).json({
      message: "Blog article created successfully",
      article: newArticle,
    });
  } catch (error) {
    console.error("Error creating article:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// --- 2. GET All Published Articles (PUBLIC) ---
const getArticles = async (req, res) => {
  try {
    const articles = await blogService.getBlogList();
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
};

// --- 3. GET Single Article (PUBLIC) ---
const getArticle = async (req, res) => {
  try {
    const article = await blogService.getArticleDetails(req.params.id);
    res.status(200).json(article);
  } catch (error) {
    console.error("Error fetching single article:", error.message);
    res.status(404).json({ error: error.message });
  }
};

// --- 4. PATCH Article Controller (ADMIN) ---
const updateBlogArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedArticle = await blogService.updateExistingArticle(
      id,
      req.body
    );

    res.status(200).json({
      message: `Article ID ${id} updated successfully.`,
      article: updatedArticle,
    });
  } catch (error) {
    console.error("Error updating article:", error.message);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      error: error.message,
    });
  }
};

// --- 5. DELETE Article Controller (ADMIN) ---
const deleteBlogArticle = async (req, res) => {
  try {
    const { id } = req.params;
    await blogService.deleteArticleById(id);

    res.status(200).json({
      message: `Article ID ${id} soft-deleted successfully (is_published=FALSE).`,
    });
  } catch (error) {
    console.error("Error deleting article:", error.message);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      error: error.message,
    });
  }
};

module.exports = {
  createBlogArticle,
  getArticles,
  getArticle,
  updateBlogArticle, // <--- NEW
  deleteBlogArticle, // <--- NEW
};
