// middleware/upload.middleware.js (MODIFICATIONS)
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// We use memoryStorage for both image and audio uploads
const storage = multer.memoryStorage();
// Use .fields() to handle multiple named files: 'thumbnail' and 'audioFile'
const upload = multer({ storage: storage });

// --- 2. Cloudinary Uploader Utility ---
// A generic upload function to handle different file fields
const uploadFileToCloudinary = (fileBuffer, fieldName, req, res, next) => {
  if (!fileBuffer) return null;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "portfolio_assets",
        resource_type: fieldName === "audioFile" ? "video" : "image", // Cloudinary treats audio as 'video' resource type
      },
      (error, result) => {
        if (result) {
          // Resolve with the URL and the original field name
          resolve({ fieldName, url: result.secure_url });
        } else {
          console.error("Cloudinary Upload Error:", error);
          reject(new Error("Image/Audio upload failed."));
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

    // 1. Check for Thumbnail file (image)
    if (req.files && req.files.thumbnail) {
      filePromises.push(
        uploadFileToCloudinary(
          req.files.thumbnail[0].buffer,
          "thumbnail",
          req,
          res,
          next
        )
      );
    }

    // 2. Check for Audio file
    if (req.files && req.files.audioFile) {
      filePromises.push(
        uploadFileToCloudinary(
          req.files.audioFile[0].buffer,
          "audioFile",
          req,
          res,
          next
        )
      );
    }

    // 3. Check for Featured Image file (Blog) <--- NEW LOGIC
    if (req.files && req.files.featured_image) {
      filePromises.push(
        uploadFileToCloudinary(
          req.files.featured_image[0].buffer,
          "featured_image",
          req,
          res,
          next
        )
      );
    }

    // Execute all uploads concurrently
    const uploadedResults = await Promise.all(filePromises);

    // Map results back to req.body
    uploadedResults.forEach((item) => {
      if (item.fieldName === "thumbnail") {
        req.body.thumbnail_url = item.url;
      } else if (item.fieldName === "audioFile") {
        // We'll map the audio URL to the 'link' property in the service
        req.body.audioUrl = item.url;
      } else if (item.fieldName === "featured_image") {
        // <--- NEW LOGIC
        req.body.featured_image_url = item.url;
      }
    });

    next(); // Proceed to the controller
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
  ]),

  // Combined Cloudinary processing middleware
  cloudinaryMiddleware: combinedUploadMiddleware,
};
