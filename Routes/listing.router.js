const express = require('express');
const Listingrouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // your multer config
const Listing = require('../Schemas/listings.schemas'); // your mongoose model
const { CreateListing ,
    GetAllListings, 
    GetSingleListing, 
    UpdateListing, 
    DeleteListing, 
    GetUserListings,
    GetUserListingById,
    AddToBookmarks,
    RemoveFromBookmarks,
    GetUserBookmarks
 } = require('../Controllers/listings.controller');
const VerifyJwt = require('../Middlewares/authentication.middleware');

// Upload up to 5 images using the 'images' field
Listingrouter.post('/listings', VerifyJwt, upload.array('images', 5), CreateListing);

Listingrouter.route('/listings').get( async (req, res) => {
    
});
Listingrouter.get('/listings/sorted',GetAllListings) // Get all listings
Listingrouter.get('/listings/:id', GetSingleListing); // Get a single listing by ID
Listingrouter.patch('/listings/:id', VerifyJwt, UpdateListing); // Update a listing by ID
Listingrouter.delete('/listings/:id', VerifyJwt, DeleteListing); // Delete a listing by ID
Listingrouter.get('/user/listings', VerifyJwt, GetUserListings); // Get all listings for the authenticated user
Listingrouter.get('/user/listings/:id', VerifyJwt, GetUserListingById); // Get a single listing by ID for the authenticated user
Listingrouter.post('/user/bookmarks', VerifyJwt, AddToBookmarks); // Add a listing to bookmarks
Listingrouter.delete('/user/bookmarks', VerifyJwt, RemoveFromBookmarks); // Remove a listing from bookmarks

// Default route for category page - redirects to "others" category by default
Listingrouter.get('/category', (req, res) => {
    res.redirect('/api/v1/category/others');
});

// Route to display listings by category
Listingrouter.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
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
            isSold: false 
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
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} | Thriftify`
        });
        
    } catch (error) {
        console.error('Error fetching category listings:', error);
        res.status(500).render('error', { 
            message: 'Error loading category page',
            error: { status: 500 }
        });
    }
});

module.exports = Listingrouter;
