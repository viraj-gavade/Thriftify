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
    try {
        const sortBy = req.query.sortBy || 'createdAt';
        const category = req.query.category;
        const location = req.query.location;
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
        // Build query object dynamically
        const query = {};
        if (category) query.category = category;
        if (location) query.location = location;
    
        // Find and sort
        const listings = await Listing.find(query)
          .populate('postedBy', 'fullname email')
          .sort({ [sortBy]: sortOrder });
    
        if (!listings.length) {
          return res.render('home', { listings: [] });
        }
    
       return res.status(200).render('home', { listings: listings });
      } catch (error) {
       return  res.render('home');
        console.error('Error fetching listings:', error);
       return res.status(500).json({ message: 'Server error' });
      }
});
Listingrouter.get('/listing/sorted',GetAllListings) // Get all listings
Listingrouter.get('/listings/:id', GetSingleListing); // Get a single listing by ID
Listingrouter.patch('/listings/:id', VerifyJwt, UpdateListing); // Update a listing by ID
Listingrouter.delete('/listings/:id', VerifyJwt, DeleteListing); // Delete a listing by ID
Listingrouter.get('/user/listings', VerifyJwt, GetUserListings); // Get all listings for the authenticated user
Listingrouter.get('/user/listings/:id', VerifyJwt, GetUserListingById); // Get a single listing by ID for the authenticated user
Listingrouter.post('/user/bookmarks', VerifyJwt, AddToBookmarks); // Add a listing to bookmarks
Listingrouter.delete('/user/bookmarks', VerifyJwt, RemoveFromBookmarks); // Remove a listing from bookmarks

module.exports = Listingrouter;
