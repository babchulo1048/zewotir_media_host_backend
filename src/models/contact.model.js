// src/models/contact.model.js
const { query } = require("../../config/database");

const saveInquiry = async (data) => {
  const { name, email, inquiryType, message, isEmailed = true } = data;

  const text = `
        INSERT INTO inquiries (name, email, inquiry_type, message, is_emailed) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
    `;
  const params = [name, email, inquiryType, message, isEmailed];

  const { rows } = await query(text, params);
  return rows[0];
};

// 🆕 Fetch all inquiries
const getAllInquiries = async () => {
  const { rows } = await query(
    "SELECT * FROM inquiries ORDER BY created_at DESC"
  );
  return rows;
};

// 🆕 Fetch inquiry by ID
const getInquiryById = async (id) => {
  const { rows } = await query("SELECT * FROM inquiries WHERE id = $1", [id]);
  return rows[0];
};

module.exports = {
  saveInquiry,
  getAllInquiries,
  getInquiryById,
};
