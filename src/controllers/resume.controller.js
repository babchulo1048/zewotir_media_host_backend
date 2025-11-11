// src/controllers/resume.controller.js
const resumeService = require("../../services/resume.service");

// --- 1. POST Resume Controller (UPLOAD) ---
const createResume = async (req, res) => {
  try {
    // 1. Extract JSON metadata ('data') and parse it
    let metadata = {};
    if (req.body.data) {
      metadata = JSON.parse(req.body.data);
    }

    // 2. Combine metadata (document_title) with file data from middleware
    const finalResumeData = {
      document_title: metadata.document_title, // The user-provided title
      file_url: req.body.file_url,
      file_public_id: req.body.file_public_id,
      file_mime_type: req.body.file_mime_type,
      // Status and uploaded_on are handled by the DB default
    };

    // 3. Pass the complete object to the service
    const newResume = await resumeService.createNewResume(finalResumeData);

    res.status(201).json(newResume);
  } catch (error) {
    console.error("Error creating resume:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// --- 2. GET All Resumes Controller ---
const getAllResumes = async (req, res) => {
  try {
    const resumes = await resumeService.getAllDocuments();
    res.status(200).json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error.message);
    res.status(500).json({ error: "Failed to fetch resumes." });
  }
};

// --- 3. DELETE Resume Controller ---
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    await resumeService.deleteDocumentById(id);

    res.status(200).json({
      message: `Resume ID ${id} soft-deleted and file removed from Cloudinary.`,
    });
  } catch (error) {
    console.error("Error deleting resume:", error.message);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      error: error.message,
    });
  }
};

module.exports = {
  createResume,
  getAllResumes,
  deleteResume,
};
