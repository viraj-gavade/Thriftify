/**
 * @fileoverview Authentication middleware for validating JWT tokens and attaching user data to requests
 */

// Custom error handler to create standardized error responses across the application
const CustomApiError = require("../utils/apiErrors");

// JWT library for verifying the authenticity and integrity of access tokens
const jwt = require('jsonwebtoken');

// User model for querying the database to validate that the token belongs to an existing user
const User = require('../Schemas/user.schemas');

// Utility that wraps async functions to handle errors and avoid try/catch blocks in each route
const asyncHandler = require('../utils/asynchandler');

/**
 * Middleware that verifies JWT tokens and attaches the user object to the request
 * 
 * @async
 * @function verifyJWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() on successful authentication or redirects on failure
 * @throws {CustomApiError} When token is invalid or verification fails
 */
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header with Bearer scheme
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
        // If no token exists, redirect to login page
        if (!token) {
            return res.redirect('/api/v1/user/login');
        }

        // Verify token signature and decode its payload
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE);

        // Find the user associated with the token's ID, excluding sensitive fields
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');
        
        // If user no longer exists in the database, redirect to login
        if (!user) {
            return res.redirect('/api/v1/user/login');
        }

        // Attach the user object to the request for use in subsequent middleware/routes
        req.user = user;

        // Continue to the next middleware or route handler
        next();
        
    } catch (error) {
        // Handle token validation errors with appropriate error status and message
        throw new CustomApiError(401, error?.message || 'Invalid access token');
    }
});

// Export the middleware for use in route protection across the application
module.exports = verifyJWT;
