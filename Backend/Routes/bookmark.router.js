/**
 * @fileoverview Bookmark routes for managing user bookmarks
 * Handles bookmark operations such as adding, removing, and retrieving bookmarks
 */

// Express framework for creating route handlers
const express = require('express');
const router = express.Router();

// Controller functions for bookmark operations
const bookmarkController = require('../Controllers/bookmark.controllers');

// Authentication middleware to protect bookmark routes
const verifyJWT = require('../Middlewares/authentication.middleware');

/**
 * Apply authentication middleware to all bookmark routes
 * All bookmark operations require the user to be authenticated
 */
router.use(verifyJWT);

/**
 * Toggle bookmark status for a listing (add/remove)
 * POST /toggle/:listingId
 * 
 * @param {string} req.params.listingId - ID of the listing to toggle bookmark status for
 */
router.post('/toggle/:listingId', bookmarkController.toggleBookmark);

/**
 * Get all bookmarked listings for the current user
 * GET /
 */
router.get('/', bookmarkController.getBookmarkedListings);

module.exports = router;
