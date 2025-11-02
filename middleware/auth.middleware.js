// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const userModel = require("../src/models/user.model");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "YOUR_SECURE_DEFAULT_SECRET";

const verifyToken = async (req, res, next) => {
  // 1. Check for the token in the Authorization header (Bearer token)
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(403).json({ error: 'Token format is "Bearer <token>".' });
  }

  try {
    // 2. Verify the token using the secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Find user in DB (optional but good practice for checking active status)
    const user = await userModel.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found." });
    }

    // 4. Attach user info to the request for controller access
    req.user = user;
    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or expired token." });
  }
};

// Middleware to specifically check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Require Admin Role!" });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
