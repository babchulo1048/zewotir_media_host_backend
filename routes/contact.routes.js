// routes/contact.routes.js
const express = require("express");
const router = express.Router();
const contactController = require("../src/controllers/contact.controller");

// POST /api/v1/contact/submit (Public access)
router.post("/submit", contactController.submitContactForm);

module.exports = router;
