/**
 * @fileoverview Listing routes for managing product listings
 * Defines all API endpoints related to listing creation, management, and retrieval
 */

// Express framework for creating route handlers
const express = require('express');
const listingRouter = express.Router();

// Multer middleware for handling file uploads (images for listings)
const upload = require('../Middlewares/multer.middleware');

// Mongoose model for database operations on listings
const Listing = require('../Schemas/listings.schemas');

// Controller functions for listing operations
const { 
    CreateListing,
    GetAllListings, 
    GetSingleListing, 
    UpdateListing, 
    DeleteListing, 
    GetUserListings,
    GetUserListingById,
    AddToBookmarks,
    RemoveFromBookmarks,
    GetUserBookmarks,
    ToggleBookmark
} = require('../Controllers/listings.controller');

// Authentication middleware to protect routes that require user login
const verifyJWT = require('../Middlewares/authentication.middleware');

/**
 * Create a new listing
 * POST /
 * Requires authentication and image uploads (up to 5)
 */
listingRouter.post('/', verifyJWT, upload.array('images', 5), CreateListing);

/**
 * Render add listing form page
 * GET /add-listing
 */
listingRouter.get('/add-listing', verifyJWT, (req, res) => {
    res.render('add-listing', {
        title: 'Add New Listing | Thriftify',
        user: req.user // Pass the user data to the template
    });
});

/**
 * Get all listings with pagination
 * GET /?page=1&limit=10
 */
listingRouter.route('/').get(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const listings = await Listing.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('postedBy', 'username avatar')
            .exec();
            
        const total = await Listing.countDocuments({ isSold: false });
        
        res.status(200).json({
            success: true,
            count: listings.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            listings
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching listings' 
        });
    }
});

/**
 * Get all listings with sorting options
 * GET /sorted
 */
listingRouter.get('/sorted', GetAllListings);

/**
 * Search listings by keyword and optional category
 * GET /search?query=search_term&category=optional_category
 */
listingRouter.get('/search', async (req, res) => {
    try {
        const { query, category } = req.query;
        
        // Build search query
        const searchQuery = {
            isSold: false,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };
        
        // Add category filter if provided
        if (category && category !== 'all') {
            searchQuery.category = category;
        }
        
        const listings = await Listing.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'username avatar')
            .exec();
            
        res.status(200).json({
            success: true,
            count: listings.length,
            listings
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Server error while searching listings' 
        });
    }
});

/**
 * Get user's bookmarked listings
 * GET /user/bookmarks
 */
listingRouter.get('/user/bookmarks', verifyJWT, GetUserBookmarks);

/**
 * Get all listings created by the authenticated user
 * GET /user/listings
 */
listingRouter.get('/user/listings', verifyJWT, GetUserListings);

/**
 * Get a specific listing created by the authenticated user
 * GET /user/listings/:id
 */
listingRouter.get('/user/listings/:id', verifyJWT, GetUserListingById);

/**
 * Get a single listing by ID
 * GET /:id
 */
listingRouter.get('/:id', verifyJWT, GetSingleListing);

/**
 * Update a listing by ID
 * PATCH /:id
 */
listingRouter.patch('/:id', verifyJWT, upload.array('images', 5), UpdateListing);

/**
 * Delete a listing by ID
 * DELETE /:id
 */
listingRouter.delete('/:id', verifyJWT, DeleteListing);

/**
 * Add a listing to user's bookmarks
 * POST /user/bookmarks
 */
listingRouter.post('/user/bookmarks', verifyJWT, AddToBookmarks);

/**
 * Remove a listing from user's bookmarks
 * DELETE /user/bookmarks
 */
listingRouter.delete('/user/bookmarks', verifyJWT, RemoveFromBookmarks);

/**
 * Toggle bookmark status for a listing
 * POST /bookmarks/toggle
 */
listingRouter.post('/bookmarks/toggle', verifyJWT, ToggleBookmark);

module.exports = listingRouter;
