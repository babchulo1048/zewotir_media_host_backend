// config/database.js
const { Pool } = require("pg");
require("dotenv").config();

// Create a new Pool instance for PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to execute a query
const query = (text, params) => pool.query(text, params);

// Test the connection
const connectDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully.");
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = {
  query,
  connectDB,
  pool,
};
