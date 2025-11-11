// src/models/resume.model.js
const { query } = require("../../config/database");

// --- 1. CREATE Resume ---
const createResume = async (data) => {
  const { document_title, file_url, file_public_id, file_mime_type } = data;

  const text = `
        INSERT INTO resumes (document_title, file_url, file_public_id, file_mime_type) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `;
  const params = [document_title, file_url, file_public_id, file_mime_type];

  const { rows } = await query(text, params);
  return rows[0];
};

// --- 2. GET All Resumes ---
const getAllResumes = async () => {
  const text =
    "SELECT * FROM resumes WHERE is_active = TRUE ORDER BY uploaded_on DESC";
  const { rows } = await query(text);
  return rows;
};

// --- 3. Get Resume by ID (Needed for updates/deletion) ---
const getResumeById = async (id) => {
  const text = "SELECT * FROM resumes WHERE id = $1";
  const { rows } = await query(text, [id]);
  return rows[0];
};

// --- 4. SOFT DELETE Resume ---
const deleteResume = async (id) => {
  // Returns file_public_id needed for Cloudinary cleanup
  const text =
    "UPDATE resumes SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, file_public_id";
  const { rows } = await query(text, [id]);
  return rows[0];
};

module.exports = {
  createResume,
  getAllResumes,
  getResumeById,
  deleteResume,
  // You can add updateResume here if needed for status changes
};
