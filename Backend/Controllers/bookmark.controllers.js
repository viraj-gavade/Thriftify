/**
 * @fileoverview Controllers for handling bookmark operations in the Thriftify application.
 * This file contains functions for adding/removing bookmarks and retrieving bookmarked listings.
 */

// User model for handling user data and bookmark operations
// Used for finding users and manipulating their bookmark collections
const User = require('../Schemas/user.schemas');

// Listing model for accessing and modifying listing data
// Used for finding listings and managing their bookmark associations
const Listing = require('../Schemas/listings.schemas');

// Utility for handling asynchronous operations with error propagation
// Wraps all controller functions to provide consistent error handling
const asyncHandler = require('../utils/asynchandler');

// Custom API error class for standardized error responses
// Used to generate consistent error objects throughout the controllers
const CustomApiError = require('../utils/apiErrors');

/**
 * Toggle bookmark status for a listing
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user information
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.listingId - ID of the listing to toggle bookmark status
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with bookmark status
 * @throws {CustomApiError} When user is not authenticated, listing not found, or user not found
 */
const toggleBookmark = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new CustomApiError(401, 'Unauthorized access!');
    }
    
    const userId = req.user._id;
    const { listingId } = req.params;
    
    // Find the listing
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
        throw new CustomApiError(404, 'Listing not found!');
    }
    
    // Check if user has already bookmarked this listing
    const userIndex = listing.bookmarkedBy.indexOf(userId);
    const isBookmarked = userIndex !== -1;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
        throw new CustomApiError(404, 'User not found!');
    }
    
    // Toggle bookmark status
    if (isBookmarked) {
        // Remove bookmark
        listing.bookmarkedBy.pull(userId);
        user.Bookmarks.pull(listingId);
    } else {
        // Add bookmark
        listing.bookmarkedBy.push(userId);
        user.Bookmarks.push(listingId);
    }
    
    // Save changes to both documents in parallel for better performance
    await Promise.all([listing.save(), user.save()]);
    
    return res.status(200).json({
        status: 'success',
        message: isBookmarked ? 'Bookmark removed' : 'Listing bookmarked',
        isBookmarked: !isBookmarked
    });
});

/**
 * Retrieve all bookmarked listings for the authenticated user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user information
 * @param {Object} res - Express response object
 * @returns {Object} Rendered bookmarks page with user's bookmarked listings
 * @throws {CustomApiError} When user is not authenticated or user not found
 */
const getBookmarkedListings = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new CustomApiError(401, 'Unauthorized access!');
    }
    
    const userId = req.user._id;
    
    // Find the user and populate bookmarks with selected fields only
    const user = await User.findById(userId).populate({
        path: 'Bookmarks',
        select: 'title description price images category isSold createdAt'
    });
    
    if (!user) {
        throw new CustomApiError(404, 'User not found!');
    }
    
    // Render the bookmarks page with the data
    return res.render('bookmarks', {
        title: 'My Bookmarks | Thriftify',
        user: req.user,
        bookmarks: user.Bookmarks
    });
});

module.exports = {
    toggleBookmark,
    getBookmarkedListings
};
