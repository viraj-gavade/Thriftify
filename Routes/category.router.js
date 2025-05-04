/**
 * @fileoverview Category routes for browsing listings by category
 * Handles category-specific page rendering and filtering
 */

// Express framework for creating route handlers
const express = require('express');
const categoryRouter = express.Router();

// Authentication middleware to protect routes that require user login
const verifyJWT = require('../Middlewares/authentication.middleware');

// Mongoose model for database operations on listings
const Listing = require('../Schemas/listings.schemas');

/**
 * Default category route - redirects to "others" category
 * GET /
 */
categoryRouter.get('/', verifyJWT, (req, res) => {
    res.redirect('/api/v1/category/others');
});

/**
 * Display listings filtered by category with optional price filtering and sorting
 * GET /:category?sort=sort_option&min=min_price&max=max_price
 * 
 * @param {string} req.params.category - Category name to filter by
 * @param {string} req.query.sort - Optional sorting method (price-low, price-high)
 * @param {number} req.query.min - Optional minimum price filter
 * @param {number} req.query.max - Optional maximum price filter
 */
categoryRouter.get('/:category', verifyJWT, async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['electronics', 'furniture', 'clothing', 'books', 'others'];
        
        // Validate category
        if (!validCategories.includes(category)) {
            return res.redirect('/category/others'); // Redirect to others category
        }
        
        // Get query parameters for filtering
        const { sort, min, max } = req.query;
        
        // Build query object
        const query = { 
            category,
            isSold: true 
        };
        
        // Add price range filtering if specified
        if (min || max) {
            query.price = {};
            if (min) query.price.$gte = Number(min);
            if (max) query.price.$lte = Number(max);
        }
        
        // Build sort options
        let sortOption = { createdAt: -1 }; // Default: newest first
        
        if (sort === 'price-low') {
            sortOption = { price: 1 };
        } else if (sort === 'price-high') {
            sortOption = { price: -1 };
        }
        
        // Fetch listings from database
        const listings = await Listing.find(query)
            .sort(sortOption)
            .populate('postedBy', 'username')
            .exec();
        
        // Render the category page with listings
        res.render('category', {
            category,
            listings,
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} | Thriftify`,
            user: req.user
        });
        
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Error loading category page',
            error: { status: 500 }
        });
    }
});

module.exports = categoryRouter;