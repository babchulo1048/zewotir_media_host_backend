// routes/contact.routes.js
const express = require("express");
const router = express.Router();
const contactController = require("../src/controllers/contact.controller");

// POST /api/v1/contact/submit (Public access)
router.post("/submit", contactController.submitContactForm);

// 🆕 GET /api/v1/contact/inquiries (Admin/Protected usually)
router.get("/inquiries", contactController.getAllInquiries);

// 🆕 GET /api/v1/contact/inquiries/:id
router.get("/inquiries/:id", contactController.getInquiryById);

module.exports = router;
