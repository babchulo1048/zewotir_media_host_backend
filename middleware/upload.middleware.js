// middleware/upload.middleware.js (MODIFICATIONS)
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// We use memoryStorage for both image and audio uploads
const storage = multer.memoryStorage();
// Use .fields() to handle multiple named files: 'thumbnail' and 'audioFile'
// const upload = multer({ storage: storage });

// --- 1. Multer Configuration (Including Resume Logic) ---
const upload = multer({
  storage: storage,
  // Enforce the 5MB limit globally
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB in bytes
  fileFilter: (req, file, cb) => {
    // Resume/Document specific filter
    if (file.fieldname === "document") {
      // Check for common document MIME types (PDF, DOCX, DOC)
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(
          new Error("Only PDF, DOC, and DOCX files are allowed for documents."),
          false
        );
      }
    }
    // Allow all other files (thumbnail, audioFile, etc.) to pass
    cb(null, true);
  },
});
// --- 2. Cloudinary Uploader Utility ---
// A generic upload function to handle different file fields
const uploadFileToCloudinary = (fileBuffer, fieldName, req, res, next) => {
  if (!fileBuffer) return null;

  let resourceType;
  if (fieldName === "audioFile") {
    resourceType = "video"; // Cloudinary treats audio as 'video'
  } else if (fieldName === "document") {
    resourceType = "raw"; // CRITICAL: Use 'raw' for non-image documents (PDF, DOCX)
  } else {
    resourceType = "image"; // Default for images (thumbnail, featured_image)
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: fieldName === "document" ? "resumes" : "portfolio_assets",
        resource_type: resourceType,
      },
      (error, result) => {
        if (result) {
          resolve({
            fieldName,
            url: result.secure_url,
            public_id: result.public_id, // Get the public ID
            mime_type: result.format, // Get the file format/type
          });
        } else {
          console.error("Cloudinary Upload Error:", error);
          reject(new Error("File upload failed."));
        }
      }
    );
    stream.end(fileBuffer);
  });
};

// --- 3. Combined Middleware to Handle Multiple Files ---
const combinedUploadMiddleware = async (req, res, next) => {
  try {
    const filePromises = [];

    // Helper to check and add files to the promise list
    const checkAndAddFile = (fieldName) => {
      if (req.files && req.files[fieldName]) {
        filePromises.push(
          uploadFileToCloudinary(
            req.files[fieldName][0].buffer,
            fieldName,
            req,
            res,
            next
          )
        );
      }
    };

    checkAndAddFile("thumbnail");
    checkAndAddFile("audioFile");
    checkAndAddFile("featured_image");
    checkAndAddFile("document"); // <--- NEW: Resume document

    const uploadedResults = await Promise.all(filePromises);

    // Map results back to req.body
    uploadedResults.forEach((item) => {
      if (item.fieldName === "thumbnail") {
        req.body.thumbnail_url = item.url;
      } else if (item.fieldName === "audioFile") {
        req.body.audioUrl = item.url;
      } else if (item.fieldName === "featured_image") {
        req.body.featured_image_url = item.url;
      } else if (item.fieldName === "document") {
        // <--- NEW MAPPING
        req.body.file_url = item.url;
        req.body.file_public_id = item.public_id;
        // Use the original Multer mimetype as it's more reliable for documents
        const documentFile = req.files.document[0];
        req.body.file_mime_type = documentFile.mimetype;
      }
    });

    next();
  } catch (error) {
    console.error("File Upload Pipeline Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // Multer middleware to handle multiple named fields: thumbnail (image) and audioFile (audio)
  multerMiddleware: upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "audioFile", maxCount: 1 },
    { name: "featured_image", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),

  // Combined Cloudinary processing middleware
  cloudinaryMiddleware: combinedUploadMiddleware,
};
