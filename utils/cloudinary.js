/**
 * @fileoverview Cloudinary file upload utility
 * Handles image upload to Cloudinary and local file cleanup
 */

// Cloudinary SDK for cloud-based image and video management
// Used for uploading and transforming images
const { v2 } = require('cloudinary');

// File system module for managing local files
// Used to remove temporary files after upload
const fs = require('fs');

/**
 * Configure Cloudinary with credentials from environment variables
 */
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRETE_KEY
});

/**
 * Uploads a file to Cloudinary and removes the local copy
 * 
 * @param {string} filePath - Local path to the file to upload
 * @returns {Object|null} Cloudinary response with file details or null if upload fails
 */
const uploadFile = async (filePath) => {
  try {
    // Return null if no file path is provided
    if (!filePath) {
      return null;
    }

    // Upload file to Cloudinary with automatic resource type detection
    const response = await v2.uploader.upload(filePath, {
      resource_type: 'auto',
    });

    // Remove the local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Return Cloudinary response with file details
    return response;
  } catch (error) {
    // Ensure local file cleanup even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Return null to indicate upload failure
    return null;
  }
};

module.exports = uploadFile;
