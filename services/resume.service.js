// services/resume.service.js
const resumeModel = require("../src/models/resume.model");
const cloudinary = require("../config/cloudinary");

// --- 1. Creation Logic ---
const createNewResume = async (resumeData) => {
  // 1. Input Validation
  if (!resumeData.document_title) {
    throw new Error("Missing required field: document_title.");
  }
  if (!resumeData.file_url || !resumeData.file_public_id) {
    throw new Error(
      "File upload failed. Document file URL or Public ID is missing."
    );
  }

  // 2. Format data for the model
  const newResumeData = {
    document_title: resumeData.document_title,
    file_url: resumeData.file_url,
    file_public_id: resumeData.file_public_id,
    file_mime_type: resumeData.file_mime_type,
  };

  // The 'version_status' and 'uploaded_on' will be set by PostgreSQL defaults.

  // 3. Call the database model
  const newResume = await resumeModel.createResume(newResumeData);
  return newResume;
};

// --- 2. Retrieval Logic ---
const getAllDocuments = async () => {
  const documents = await resumeModel.getAllResumes();
  return documents;
};

// --- 3. Deletion Logic (Soft Delete + Cloudinary Cleanup) ---
const deleteDocumentById = async (id) => {
  const resumeId = parseInt(id);

  const existingResume = await resumeModel.getResumeById(resumeId);
  if (!existingResume) {
    throw new Error(`Resume with ID ${resumeId} not found.`);
  }

  // 1. Perform Soft Delete in DB
  const deletedRow = await resumeModel.deleteResume(resumeId);

  // 2. Delete file from Cloudinary to free up space (uses 'raw' resource type)
  if (deletedRow.file_public_id) {
    try {
      await cloudinary.uploader.destroy(deletedRow.file_public_id, {
        resource_type: "raw", // Must match the resource_type used on upload
      });
    } catch (cloudinaryError) {
      console.warn(
        `Cloudinary cleanup failed for ${deletedRow.file_public_id}.`
      );
    }
  }

  return { id: resumeId };
};

module.exports = {
  createNewResume,
  getAllDocuments,
  deleteDocumentById,
};
