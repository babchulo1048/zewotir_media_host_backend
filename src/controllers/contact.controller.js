// src/controllers/contact.controller.js
const contactService = require("../../services/contact.service");

const submitContactForm = async (req, res) => {
  try {
    const result = await contactService.processInquiry(req.body);

    // Use 202 Accepted if the email is being processed asynchronously,
    // or 200 OK if success is confirmed instantly.
    res.status(200).json({
      message: "Thank you for your inquiry. I will respond within 24 hours.",
      details: result,
    });
  } catch (error) {
    console.error("Contact form submission error:", error.message);
    // Use 400 for validation errors or 500 for server issues (like DB connection failure)
    res.status(400).json({ error: error.message });
  }
};

// 🆕 Get all inquiries
const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await contactService.fetchAllInquiries();
    res.status(200).json(inquiries);
  } catch (error) {
    console.error("Error fetching inquiries:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// 🆕 Get a single inquiry by ID
const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await contactService.fetchInquiryById(id);
    res.status(200).json(inquiry);
  } catch (error) {
    console.error("Error fetching inquiry:", error.message);
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  submitContactForm,
  getAllInquiries,
  getInquiryById,
};
