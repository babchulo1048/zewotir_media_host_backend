// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../src/controllers/auth.controller");

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new admin user
 * @access Public (usually secured after first admin is created)
 */
router.post("/register", authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login an admin user
 * @access Public
 */
router.post("/login", authController.login);

module.exports = router;
