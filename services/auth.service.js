// services/auth.service.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../src/models/user.model");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECURE_DEFAULT_SECRET";
const SALT_ROUNDS = 10;

// --- Helper Functions ---
const generateToken = (user) => {
  // Payload should contain non-sensitive info needed for future requests
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" } // Token expires in 1 day
  );
};

// --- Main Service Functions ---

const register = async (username, email, password) => {
  // 1. Check if user already exists
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    // We throw a custom error to be handled by the controller
    throw new Error("Email is already in use.");
  }

  // 2. Hash the password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create the user in the database
  const newUser = await userModel.createUser(username, email, password_hash);

  // 4. Generate a JWT token
  const token = generateToken(newUser);

  return { user: newUser, token };
};

const login = async (email, password) => {
  // 1. Find the user by email
  const user = await userModel.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials.");
  }

  // 2. Compare the plain password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Invalid credentials.");
  }

  // 3. Generate a JWT token
  const token = generateToken(user);

  // Exclude the sensitive hash from the returned user object
  const { password_hash, ...publicUser } = user;

  return { user: publicUser, token };
};

module.exports = {
  register,
  login,
  generateToken,
};
