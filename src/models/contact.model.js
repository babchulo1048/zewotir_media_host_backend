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

module.exports = {
  saveInquiry,
};
