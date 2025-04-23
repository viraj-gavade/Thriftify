const express = require('express');
const Listingrouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // your multer config
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
Listingrouter.get('/listings', GetAllListings); // Get all listings
Listingrouter.get('/listings/:id', GetSingleListing); // Get a single listing by ID
Listingrouter.patch('/listings/:id', VerifyJwt, UpdateListing); // Update a listing by ID
Listingrouter.delete('/listings/:id', VerifyJwt, DeleteListing); // Delete a listing by ID
Listingrouter.get('/user/listings', VerifyJwt, GetUserListings); // Get all listings for the authenticated user
Listingrouter.get('/user/listings/:id', VerifyJwt, GetUserListingById); // Get a single listing by ID for the authenticated user
Listingrouter.post('/user/bookmarks', VerifyJwt, AddToBookmarks); // Add a listing to bookmarks
Listingrouter.delete('/user/bookmarks', VerifyJwt, RemoveFromBookmarks); // Remove a listing from bookmarks
Listingrouter.get('/user/bookmarks', VerifyJwt, GetUserBookmarks); // Get all bookmarks for the authenticated user
module.exports = Listingrouter;
