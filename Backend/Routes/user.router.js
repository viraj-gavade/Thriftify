/**
 * @fileoverview User routes for authentication and profile management
 * Handles user registration, login, profile updates, and related user operations
 */

// Express framework for creating route handlers
const express = require('express');
const userRouter = express.Router();

// User model for database operations on user accounts
const User = require('../Schemas/user.schemas');

// Multer middleware for handling profile picture uploads
const upload = require('../Middlewares/multer.middleware');

// User controller functions that implement route logic
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUser, 
    UpdateDetails, 
    UpdateProfilePic, 
    changeCurrentPassword 
} = require('../Controllers/user.controllers');

// Authentication middleware to protect routes that require user login
const verifyJWT = require('../Middlewares/authentication.middleware');

// Listing model for populating user's listings in profile
const Listing = require('../Schemas/listings.schemas');

// Utility for handling async functions in Express routes
const asyncHandler = require('../utils/asynchandler');

/**
 * Test route to check if user router is working
 * GET /
 */
userRouter.route('/').get((req, res) => {
    res.status(200).json({ message: 'User router path working' });
});

/**
 * User registration route
 * GET - Renders signup form
 * POST - Processes user registration with file upload
 */
userRouter.route('/signup')
    .get((req, res) => {
        res.render('signup');
    })
    .post(
        upload.fields([
            { name: 'profilepic', maxCount: 1 },
        ]),
        registerUser
    );

/**
 * User login route
 * GET - Renders login form
 * POST - Processes user login
 */
userRouter.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post(loginUser);

/**
 * User logout route
 * GET - Processes user logout and clears authentication
 */
userRouter.route('/logout').get(logoutUser);

/**
 * User profile page route
 * GET - Renders the user's profile with related data
 */
userRouter.route('/profile').get(verifyJWT, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('listings')
        .populate({
            path: 'orders',
            populate: {
                path: 'listing',
                select: 'title description price images'
            }
        })
        .populate('Bookmarks');
    
    res.render('profile', {
        user: user,
        listings: user.listings,
        orders: user.orders,
    });
}));

/**
 * Get user by ID
 * GET /profile/:id
 */
userRouter.route('/profile/:id').get(getUser);

/**
 * Update user details
 * PATCH /update-details
 */
userRouter.route('/update-details').patch(verifyJWT, UpdateDetails);

/**
 * Update user password
 * PATCH /update-password
 */
userRouter.route('/update-password').patch(verifyJWT, changeCurrentPassword);

/**
 * Update user profile picture
 * PATCH /update-profilepic
 */
userRouter.route('/update-profilepic')
    .patch(
        upload.fields([
            { name: 'profilepic', maxCount: 1 },
        ]),
        verifyJWT,
        UpdateProfilePic
    );

/**
 * Get user bookmarks
 * GET /bookmarks
 * Returns simplified bookmark list for frontend use
 */
userRouter.route('/bookmarks').get(verifyJWT, asyncHandler(async (req, res) => {
    // Get user data with populated bookmarks
    const user = await req.user.populate('Bookmarks');
    
    // Format bookmarks for frontend consumption
    const bookmarks = user.Bookmarks.map(bookmark => ({
        listingId: bookmark._id,
        title: bookmark.title,
    }));
    
    res.status(200).json(bookmarks);
}));

/**
 * Get user orders
 * GET /my-orders
 * Returns list of user's orders
 */
userRouter.route('/my-orders').get(verifyJWT, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('orders');
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.orders);
}));

/**
 * Check user authentication status
 * GET /check-auth
 * Returns user data if authenticated
 */
userRouter.route('/check-auth').get(verifyJWT, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('listings')
        .populate('Bookmarks');
    
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.status(200).json({ user });
}));

module.exports = userRouter;
