const express = require('express');
const Listingrouter = express.Router();
const upload = require('../Middlewares/multer.middleware'); // your multer config
const { CreateListing } = require('../Controllers/listings.controller');
const VerifyJwt = require('../Middlewares/authentication.middleware');

// Upload up to 5 images using the 'images' field
Listingrouter.post('/create-listing', VerifyJwt, upload.array('images', 5), CreateListing);

module.exports = Listingrouter;
