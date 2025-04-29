const express = require('express');
const router = express.Router();
const bookmarkController = require('../Controllers/bookmark.controllers');
const VerifyJwt = require('../Middlewares/authentication.middleware');


// Apply authentication middleware to all bookmark routes
router.use(VerifyJwt);

// Toggle bookmark status
router.post('/toggle/:listingId', bookmarkController.toggleBookmark);

// Get all bookmarked listings
router.get('/', bookmarkController.getBookmarkedListings);

module.exports = router;
