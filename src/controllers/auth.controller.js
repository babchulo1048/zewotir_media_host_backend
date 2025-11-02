// src/controllers/auth.controller.js
const authService = require("../../services/auth.service");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Simple input validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const { user, token } = await authService.register(
      username,
      email,
      password
    );

    // Success response
    res.status(201).json({
      message: "Admin registered successfully.",
      user,
      token,
    });
  } catch (error) {
    // Handle specific service errors
    if (error.message.includes("Email is already in use")) {
      return res.status(409).json({ error: error.message }); // 409 Conflict
    }
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Registration failed." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const { user, token } = await authService.login(email, password);

    // Success response
    res.status(200).json({
      message: "Login successful.",
      user,
      token,
    });
  } catch (error) {
    // Handle specific service errors (e.g., Invalid credentials)
    if (error.message.includes("Invalid credentials")) {
      return res.status(401).json({ error: error.message }); // 401 Unauthorized
    }
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Login failed." });
  }
};

module.exports = {
  register,
  login,
};
