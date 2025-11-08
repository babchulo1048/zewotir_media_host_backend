// services/portfolio.service.js
const assetModel = require("../src/models/asset.model");

// --- Define the 5 Valid Types ---
const validTypes = ["tvhost", "mcing", "interviews", "voiceover", "art"];

// --- 1. Creation Logic ---
const createNewAsset = async (assetData) => {
  console.log("assetData:", assetData);
  // Input validation
  if (!assetData.title || !assetData.asset_type) {
    throw new Error("Missing required fields: title and asset_type.");
  }

  // Ensure asset_type is valid (UPDATED VALIDATION)
  if (!validTypes.includes(assetData.asset_type)) {
    throw new Error("Invalid asset type provided for creation.");
  }

  let primaryLink = assetData.link || null;
  // Check for audioUrl if it's voiceover (logic remains the same)
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

// --- 2. Retrieval Logic (SIMPLIFIED) ---
const getAssets = async (type) => {
  // Now, the type passed from the frontend URL directly matches the DB ENUM
  if (!validTypes.includes(type)) {
    throw new Error("Invalid asset type requested for retrieval.");
  }

  // Directly use the type to fetch assets
  const assets = await assetModel.getAssetsByType(type);
  return assets;
};

// --- 3. Update Logic ---
const updateExistingAsset = async (id, assetData) => {
  const assetId = parseInt(id);

  // 1. Check if asset exists
  const existingAsset = await assetModel.getAssetById(assetId);
  if (!existingAsset) {
    throw new Error(`Asset with ID ${assetId} not found.`);
  }

  // Validate the new asset type if provided
  const newAssetType = assetData.asset_type || existingAsset.asset_type;
  if (!validTypes.includes(newAssetType)) {
    throw new Error("Invalid asset type provided for update.");
  }

  // 2. Prepare Data for Update (Link logic remains the same for voiceover)
  let primaryLink = assetData.link || existingAsset.link_url;

  if (newAssetType === "voiceover") {
    primaryLink = assetData.audioUrl || primaryLink;
  }

  // Merge new data with existing, prioritizing new values
  const updateData = {
    title: assetData.title,
    asset_type: assetData.asset_type,
    description: assetData.description,
    link_url: primaryLink,
    thumbnail_url: assetData.thumbnail_url,
    details: assetData.type_specific_details,
  };

  // 3. Call the model to perform the update
  const updatedAsset = await assetModel.updateAsset(assetId, updateData);
  return updatedAsset;
};

// --- 4. Delete Logic (No Change) ---
const deleteAssetById = async (id) => {
  const assetId = parseInt(id);

  const existingAsset = await assetModel.getAssetById(assetId);
  if (!existingAsset) {
    throw new Error(`Asset with ID ${assetId} not found.`);
  }

  const deletedRow = await assetModel.deleteAsset(assetId);
  if (!deletedRow) {
    throw new Error(`Failed to delete asset ID ${assetId}.`);
  }

  return { id: assetId };
};

module.exports = {
  createNewAsset,
  getAssets,
  updateExistingAsset,
  deleteAssetById,
};
