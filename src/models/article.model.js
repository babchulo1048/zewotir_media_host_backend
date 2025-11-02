// src/models/article.model.js
const { query } = require("../../config/database");

// --- 1. CREATE Article (used for POST /articles) ---
const createArticle = async (data) => {
  const { title, excerpt, content, category, featured_image_url } = data;

  const text = `
        INSERT INTO articles (title, excerpt, content, category, featured_image_url, is_published) 
        VALUES ($1, $2, $3, $4, $5, TRUE) -- Default to published (TRUE) for now
        RETURNING *
    `;
  const params = [title, excerpt, content, category, featured_image_url];

  const { rows } = await query(text, params);
  return rows[0];
};

// --- 2. GET All Published Articles (used for GET /articles) ---
const getPublishedArticles = async () => {
  const text = `
        SELECT id, title, excerpt, category, featured_image_url, created_at 
        FROM articles 
        WHERE is_published = TRUE 
        ORDER BY created_at DESC
    `;
  const { rows } = await query(text);
  return rows;
};

// --- 3. GET Single Article by ID (used for GET /articles/:id) ---
const getArticleById = async (id) => {
  const text = "SELECT * FROM articles WHERE id = $1 AND is_published = TRUE";
  const { rows } = await query(text, [id]);
  return rows[0];
};

// --- 4. UPDATE Article (PATCH /articles/:id) ---
const updateArticle = async (id, data) => {
  const {
    title,
    excerpt,
    content,
    category,
    featured_image_url,
    is_published,
  } = data;

  // NOTE: Use COALESCE to update only provided fields
  const text = `
        UPDATE articles SET
            title = COALESCE($1, title),
            excerpt = COALESCE($2, excerpt),
            content = COALESCE($3, content),
            category = COALESCE($4, category),
            featured_image_url = COALESCE($5, featured_image_url),
            is_published = COALESCE($6, is_published),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
    `;
  const params = [
    title,
    excerpt,
    content,
    category,
    featured_image_url,
    is_published,
    id,
  ];

  const { rows } = await query(text, params);
  return rows[0];
};

// --- 5. DELETE Article (DELETE /articles/:id) ---
// We perform a SOFT DELETE by setting is_published = FALSE
const deleteArticle = async (id) => {
  // Perform a soft delete: set is_published to FALSE
  const text = `
        UPDATE articles 
        SET is_published = FALSE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1 
        RETURNING id
    `;
  const { rows } = await query(text, [id]);
  return rows[0];
};

module.exports = {
  createArticle,
  getPublishedArticles,
  getArticleById,
  updateArticle, // <--- NEW
  deleteArticle, // <--- NEW
};
