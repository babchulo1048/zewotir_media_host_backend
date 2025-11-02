// src/models/user.model.js
const { query } = require("../../config/database");

// 1. Find a user by their email (used for login and signup check)
const findUserByEmail = async (email) => {
  const text = "SELECT * FROM users WHERE email = $1";
  const { rows } = await query(text, [email]);
  return rows[0]; // Returns user object or undefined
};

// 2. Create a new user (used for registration)
const createUser = async (username, email, password_hash) => {
  const text =
    "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role, created_at";
  const { rows } = await query(text, [username, email, password_hash]);
  return rows[0];
};

// 3. Find a user by ID (used by authentication middleware)
const findUserById = async (id) => {
  const text = "SELECT id, username, email, role FROM users WHERE id = $1";
  const { rows } = await query(text, [id]);
  return rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};
