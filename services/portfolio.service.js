// services/portfolio.service.js
const assetModel = require("../src/models/asset.model");

// --- 1. Creation Logic ---
const createNewAsset = async (assetData) => {
  console.log("assetdata:", assetData);
  // Input validation
  if (!assetData.title || !assetData.asset_type) {
    throw new Error("Missing required fields: title and asset_type.");
  }

  // Ensure asset_type is valid (though DB schema handles this with ENUM)
  const validTypes = ["media", "voiceover", "art"];
  if (!validTypes.includes(assetData.asset_type)) {
    throw new Error("Invalid asset type provided.");
  }

  console.log("TYPE:", assetData.asset_type);
  console.log("AUDIO URL:", assetData.audioUrl);

  let primaryLink = assetData.link || null;
  // FIX: Explicitly check for audioUrl (set by middleware) if it's a voiceover
  if (assetData.asset_type === "voiceover" && assetData.audioUrl) {
    primaryLink = assetData.audioUrl;
  }
  // Format data for the model
  const newAssetData = {
    title: assetData.title,
    asset_type: assetData.asset_type,
    description: assetData.description || null,
    link_url: primaryLink,
    thumbnail_url: assetData.thumbnail_url || null,
    // Store type-specific data in JSONB
    details: assetData.type_specific_details || {},
  };

  // Call the database model
  const newAsset = await assetModel.createAsset(newAssetData);
  return newAsset;
};

// --- 2. Retrieval Logic ---
const getAssets = async (type) => {
  // Basic validation on the requested type
  const validTypes = ["media", "voiceover", "art"];
  if (!validTypes.includes(type)) {
    throw new Error("Invalid asset type requested for retrieval.");
  }

  const assets = await assetModel.getAssetsByType(type);
  return assets;
};

// --- 3. Update Logic (UPDATE /assets/:id) ---
const updateExistingAsset = async (id, assetData) => {
  const assetId = parseInt(id);

  // 1. Check if asset exists
  const existingAsset = await assetModel.getAssetById(assetId);
  if (!existingAsset) {
    throw new Error(`Asset with ID ${assetId} not found.`);
  }

  // 2. Prepare Data for Update
  // NOTE: Cloudinary middleware already placed new file URLs (thumbnail_url, audioUrl) into req.body/assetData.

  // Handle primary link update logic (similar to create)
  let primaryLink = assetData.link || existingAsset.link_url; // Use existing if not provided

  if (
    assetData.asset_type === "voiceover" ||
    existingAsset.asset_type === "voiceover"
  ) {
    // Prioritize the new audioUrl if provided, otherwise use existing link_url
    primaryLink = assetData.audioUrl || primaryLink;
  }

  // Merge new data with existing, prioritizing new values
  const updateData = {
    title: assetData.title,
    asset_type: assetData.asset_type,
    description: assetData.description,
    link_url: primaryLink,
    thumbnail_url: assetData.thumbnail_url, // URL from middleware (if new file uploaded)
    details: assetData.type_specific_details,
  };

  // 3. Call the model to perform the update
  const updatedAsset = await assetModel.updateAsset(assetId, updateData);
  return updatedAsset;
};

// --- 4. Delete Logic (DELETE /assets/:id) ---
const deleteAssetById = async (id) => {
  const assetId = parseInt(id);

  // 1. Check if asset exists (optional, but good for reporting)
  const existingAsset = await assetModel.getAssetById(assetId);
  if (!existingAsset) {
    throw new Error(`Asset with ID ${assetId} not found.`);
  }

  // 2. Perform soft delete
  const deletedRow = await assetModel.deleteAsset(assetId);
  if (!deletedRow) {
    throw new Error(`Failed to delete asset ID ${assetId}.`);
  }

  return { id: assetId };
};

module.exports = {
  createNewAsset,
  getAssets,
  updateExistingAsset, // <--- NEW
  deleteAssetById, // <--- NEW
};
