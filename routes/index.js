// routes/index.js
const express = require("express");
const router = express.Router();

const portfolioRoutes = require("./portfolio.routes");
const authRoutes = require("./auth.routes"); // <--- NEW
const blogRoutes = require("./blog.routes");
const contactRoutes = require("./contact.routes");

// Register the routes
router.use("/portfolio", portfolioRoutes);
router.use("/blog", blogRoutes);

router.use(express.json());
router.use("/contact", contactRoutes);
router.use("/auth", authRoutes); // <--- NEW

module.exports = router;
