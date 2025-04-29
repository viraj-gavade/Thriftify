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
const { verify } = require('jsonwebtoken');
const listingsController = require('../Controllers/listings.controller');
// Upload up to 5 images using the 'images' field
Listingrouter.post('/listings', VerifyJwt, upload.array('images', 5), CreateListing);

// Route for rendering the add-listing page
Listingrouter.get('/add-listing', VerifyJwt, (req, res) => {
    res.render('add-listing', {
        title: 'Add New Listing | Thriftify',
        user: req.user // Pass the user data to the template
    });
});

// Route for fetching all listings with pagination
Listingrouter.route('/listings').get(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const listings = await Listing.find({ isSold: false })
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
        console.error('Error fetching listings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching listings' 
        });
    }
});

// Get all listings with sorting options
Listingrouter.get('/listings/sorted', GetAllListings);

// Search listings by keyword
Listingrouter.get('/listings/search', async (req, res) => {
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
        console.error('Error searching listings:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while searching listings' 
        });
    }
});

// Get user bookmarks
Listingrouter.get('/user/bookmarks', VerifyJwt, GetUserBookmarks);

// Get a single listing by ID
Listingrouter.get('/listings/:id',VerifyJwt, GetSingleListing);

// Update a listing by ID
Listingrouter.patch('/listings/:id', VerifyJwt, upload.array('images', 5), UpdateListing);

// Delete a listing by ID
Listingrouter.delete('/listings/:id', VerifyJwt, DeleteListing);

// Get all listings for the authenticated user
Listingrouter.get('/user/listings', VerifyJwt, GetUserListings);

// Get a single listing by ID for the authenticated user
Listingrouter.get('/user/listings/:id', VerifyJwt, GetUserListingById);

// Add a listing to bookmarks
Listingrouter.post('/user/bookmarks', VerifyJwt, AddToBookmarks);

// Remove a listing from bookmarks
Listingrouter.delete('/user/bookmarks', VerifyJwt, RemoveFromBookmarks);

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

Listingrouter.post('/bookmarks/toggle', VerifyJwt, listingsController.ToggleBookmark);
module.exports = Listingrouter;
