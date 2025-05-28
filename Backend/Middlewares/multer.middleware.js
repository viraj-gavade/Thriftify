/**
 * @fileoverview Multer configuration for handling file uploads in Thriftify
 * This middleware manages temporary file storage before cloudinary processing
 */

// Multer is a middleware for handling multipart/form-data (file uploads)
// Used here to configure temporary storage of uploaded files before further processing
const multer = require('multer');

/**
 * Configure disk storage settings for temporary file uploads
 * Files are stored temporarily before being processed and moved to Cloudinary
 */
const storage = multer.diskStorage({
    /**
     * Sets the directory where uploaded files will be temporarily stored
     * 
     * @param {Object} req - Express request object
     * @param {Object} file - File object containing details of the uploaded file
     * @param {Function} cb - Callback function to set destination directory
     */
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    
    /**
     * Determines the filename of the uploaded file in the destination directory
     * 
     * @param {Object} req - Express request object
     * @param {Object} file - File object containing details of the uploaded file
     * @param {Function} cb - Callback function to set the filename
     */
    filename: function (req, file, cb) {
        // Using original filename - in production, consider generating unique filenames
        // to prevent overwriting existing files with the same name
        cb(null, file.originalname);
    }
});

// Configure the multer middleware with the storage settings
const upload = multer({ storage: storage });

// Export the configured multer instance for use in route handlers
module.exports = upload;