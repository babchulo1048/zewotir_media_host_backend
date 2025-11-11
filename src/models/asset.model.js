// src/models/asset.model.js
const { query } = require("../../config/database");

// --- 1. CREATE Asset (used for POST /assets) ---
const createAsset = async (data) => {
  const { title, asset_type, description, link_url, thumbnail_url, details } =
    data;

  const text = `
        INSERT INTO assets (title, asset_type, description, link_url, thumbnail_url, details) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
    `;
  const params = [
    title,
    asset_type,
    description,
    link_url,
    thumbnail_url,
    details,
  ];

  const { rows } = await query(text, params);
  return rows[0];
};

// --- 2. GET Assets by Type (used for GET /assets/:type) ---
const getAssetsByType = async (asset_type) => {
  const text =
    "SELECT * FROM assets WHERE asset_type = $1 AND is_active = TRUE ORDER BY created_at DESC";
  const { rows } = await query(text, [asset_type]);
  return rows;
};

// --- 3. GET Single Asset by ID (Used for validation) ---
const getAssetById = async (id) => {
  const text = "SELECT * FROM assets WHERE id = $1";
  const { rows } = await query(text, [id]);
  return rows[0];
};

// --- 4. UPDATE Asset (PATCH /assets/:id) ---
const updateAsset = async (id, data) => {
  const { title, asset_type, description, link_url, thumbnail_url, details } =
    data;

  // NOTE: Uses COALESCE to update only provided fields, keeping existing values otherwise.
  const text = `
        UPDATE assets SET
            title = COALESCE($1, title),
            asset_type = COALESCE($2, asset_type),
            description = COALESCE($3, description),
            link_url = COALESCE($4, link_url),
            thumbnail_url = COALESCE($5, thumbnail_url),
            details = COALESCE($6, details),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
    `;
  const params = [
    title,
    asset_type,
    description,
    link_url,
    thumbnail_url,
    details,
    id,
  ];

  const { rows } = await query(text, params);
  return rows[0];
};

// --- 5. DELETE Asset (DELETE /assets/:id) ---
// We usually perform a SOFT DELETE by setting is_active = FALSE
const deleteAsset = async (id) => {
  // Perform a soft delete: set is_active to FALSE
  const text =
    "UPDATE assets SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id";
  const { rows } = await query(text, [id]);
  return rows[0];
};

// --- 6. GET ALL Assets (Used for GET /assets) ---
const getAllAssets = async () => {
  const text = `
    SELECT * FROM assets
    WHERE is_active = TRUE
    ORDER BY created_at DESC
  `;
  const { rows } = await query(text);
  return rows;
};

module.exports = {
  createAsset,
  getAssetsByType,
  getAssetById, // <--- NEW
  updateAsset, // <--- NEW
  deleteAsset, // <--- NEW
  getAllAssets,
};
