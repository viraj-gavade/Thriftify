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
const listingsController = require('../Controllers/listings.controller');
// Upload up to 5 images using the 'images' field
Listingrouter.post('/', VerifyJwt, upload.array('images', 5), CreateListing);

// Route for rendering the add-listing page
Listingrouter.get('/add-listing', VerifyJwt, (req, res) => {
    res.render('add-listing', {
        title: 'Add New Listing | Thriftify',
        user: req.user // Pass the user data to the template
    });
});

// Route for fetching all listings with pagination
Listingrouter.route('/').get(async (req, res) => {
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
Listingrouter.get('/sorted', GetAllListings);

// Search listings by keyword
Listingrouter.get('/search', async (req, res) => {
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
Listingrouter.get('/:id',VerifyJwt, GetSingleListing);

// Update a listing by ID
Listingrouter.patch('/:id', VerifyJwt, upload.array('images', 5), UpdateListing);

// Delete a listing by ID
Listingrouter.delete('/:id', VerifyJwt, DeleteListing);

// Get all listings for the authenticated user
Listingrouter.get('/user/listings', VerifyJwt, GetUserListings);

// Get a single listing by ID for the authenticated user
Listingrouter.get('/user/listings/:id', VerifyJwt, GetUserListingById);

// Add a listing to bookmarks
Listingrouter.post('/user/bookmarks', VerifyJwt, AddToBookmarks);

// Remove a listing from bookmarks
Listingrouter.delete('/user/bookmarks', VerifyJwt, RemoveFromBookmarks);

// Default route for category page - redirects to "others" category by default


Listingrouter.post('/bookmarks/toggle', VerifyJwt, listingsController.ToggleBookmark);
module.exports = Listingrouter;
