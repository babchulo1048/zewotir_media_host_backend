// src/controllers/portfolio.controller.js
const portfolioService = require("../../services/portfolio.service");

// --- 1. POST Asset Controller ---
const createPortfolioAsset = async (req, res) => {
  try {
    let assetDataFromFrontend = {};
    if (req.body.data) {
      assetDataFromFrontend = JSON.parse(req.body.data);
    }

    // 2. --- Merge the JSON metadata with file URLs from the middleware ---
    // The cloudinaryMiddleware already places new file URLs (thumbnail_url, audioUrl) on req.body.

    const finalAssetData = {
      ...assetDataFromFrontend,
      // Override the link/thumbnail if the middleware found a new file URL
      link_url: assetDataFromFrontend.link_url || req.body.audioUrl || null,
      thumbnail_url: req.body.thumbnail_url || null, // Updated by cloudinaryMiddleware
    };

    // 3. --- Pass the complete, parsed object to the service ---
    const newAsset = await portfolioService.createNewAsset(finalAssetData);

    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating asset:", error.message);
    // Use a 400 for bad user input (validation errors from service)
    res.status(400).json({ error: error.message });
  }
};

// --- 2. GET Assets by Type Controller ---
const getAssetsByType = async (req, res) => {
  try {
    const { type } = req.params; // e.g., 'media'
    const assets = await portfolioService.getAssets(type);

    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error.message);
    // Use a 400 for invalid type, 500 for DB error
    res.status(400).json({ error: error.message });
  }
};

// --- 3. PATCH Asset Controller (ADMIN) ---
const updatePortfolioAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAsset = await portfolioService.updateExistingAsset(
      id,
      req.body
    );

    res.status(200).json({
      message: `Asset ID ${id} updated successfully.`,
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Error updating asset:", error.message);
    // 404 for asset not found, 400 for bad data
    res.status(error.message.includes("not found") ? 404 : 400).json({
      error: error.message,
    });
  }
};

// --- 4. DELETE Asset Controller (ADMIN) ---
const deletePortfolioAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await portfolioService.deleteAssetById(id);

    res.status(200).json({
      message: `Asset ID ${id} soft-deleted successfully (is_active=FALSE).`,
    });
  } catch (error) {
    console.error("Error deleting asset:", error.message);
    res.status(error.message.includes("not found") ? 404 : 400).json({
      error: error.message,
    });
  }
};

// --- 5. GET All Assets Controller ---
const getAllAssets = async (req, res) => {
  try {
    const assets = await portfolioService.getAllAssets();
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching all assets:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPortfolioAsset,
  getAssetsByType,
  updatePortfolioAsset, // <--- NEW
  deletePortfolioAsset, // <--- NEW
  getAllAssets,
};
