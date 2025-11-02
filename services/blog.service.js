// services/blog.service.js
const articleModel = require("../src/models/article.model");

// --- 1. Creation Logic ---
const createNewArticle = async (articleData) => {
  // Simple validation check
  if (!articleData.title || !articleData.excerpt || !articleData.content) {
    throw new Error("Missing required fields: title, excerpt, and content.");
  }

  // Map incoming data (req.body) to model fields
  const newArticleData = {
    title: articleData.title,
    excerpt: articleData.excerpt,
    content: articleData.content,
    category: articleData.category || null,
    // Use the URL provided by the Cloudinary middleware
    featured_image_url: articleData.featured_image_url || null,
  };

  const newArticle = await articleModel.createArticle(newArticleData);
  return newArticle;
};

// --- 2. Retrieval Logic ---
const getBlogList = async () => {
  return articleModel.getPublishedArticles();
};

const getArticleDetails = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    throw new Error("Invalid article ID.");
  }
  const article = await articleModel.getArticleById(parseInt(id));
  if (!article) {
    throw new Error("Article not found or not published.");
  }
  return article;
};

// --- 3. Update Logic (PATCH /articles/:id) ---
const updateExistingArticle = async (id, articleData) => {
  const articleId = parseInt(id);

  // 1. Check if article exists (including unpublished ones for admin)
  // NOTE: getArticleById only retrieves published ones, so we'll add a simple check here if needed.
  // However, since the model update will return null if it fails, we can rely on that.

  // 2. Prepare Data for Update
  const updateData = {
    title: articleData.title,
    excerpt: articleData.excerpt,
    content: articleData.content,
    category: articleData.category,
    // URL from middleware (if new file uploaded). This will be null if no new file.
    featured_image_url: articleData.featured_image_url,
    // Admin can toggle publication status
    is_published: articleData.is_published,
  };

  // 3. Call the model to perform the update
  const updatedArticle = await articleModel.updateArticle(
    articleId,
    updateData
  );

  if (!updatedArticle) {
    throw new Error(`Article with ID ${articleId} not found.`);
  }

  return updatedArticle;
};

// --- 4. Delete Logic (DELETE /articles/:id) ---
const deleteArticleById = async (id) => {
  const articleId = parseInt(id);

  // 1. Perform soft delete
  const deletedRow = await articleModel.deleteArticle(articleId);

  if (!deletedRow) {
    throw new Error(`Failed to delete or article ID ${articleId} not found.`);
  }

  return { id: articleId };
};

module.exports = {
  createNewArticle,
  getBlogList,
  getArticleDetails,
  updateExistingArticle, // <--- NEW
  deleteArticleById, // <--- NEW
};
