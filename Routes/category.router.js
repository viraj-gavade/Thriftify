const express = require('express');
const CategoryRouter = express.Router();
const VerifyJwt = require('../Middlewares/authentication.middleware');
const Listing = require('../Schemas/listings.schemas'); // Import the Listing model

CategoryRouter.get('/',VerifyJwt, (req, res) => {
    res.redirect('/api/v1/category/others');
});

// Route to display listings by category
CategoryRouter.get('/:category', VerifyJwt, async (req, res) => {
    try {
        const { category } = req.params;
        console.log('Category:', category); // Log the category for debugging
        const validCategories = ['electronics', 'furniture', 'clothing', 'books', 'others'];
        
        // Validate category
        if (!validCategories.includes(category)) {
            return res.redirect('/category/others'); // Redirect to others instead of showing error
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
            user: req.user, // Pass the user data to the template
        });
        
    } catch (error) {
        console.error('Error fetching category listings:', error);
        res.status(500).render('error', { 
            message: 'Error loading category page',
            error: { status: 500 }
        });
    }
});

module.exports = CategoryRouter;