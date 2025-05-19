const fs = require('fs');
const path = require('path');
const uploadFile = require('../utils/cloudinary');
const Listing = require('../Schemas/listings.schemas');
const User = require('../Schemas/user.schemas');
const asyncHandler = require('../utils/asynchandler');
const CustomApiError = require('../utils/apiErrors');
const ApiResponse = require('../utils/apiResponse');

const CreateListing = asyncHandler(async (req, res) => {
    try {
        const { title, description, price, category, location } = req.body;
        const userId = req.user._id;

        const existingListing = await Listing.findOne({ title, user: userId });
        if (existingListing) {
            throw new CustomApiError(400, 'Listing already exists');
        }

        // Upload each file to Cloudinary and get secure URLs
        const imageUploadPromises = req.files.map(file => uploadFile(file.path));
        const uploadedImages = await Promise.all(imageUploadPromises);
        const imageUrls = uploadedImages.map(img => img.secure_url);

        // Clean up temp files after upload
        req.files.forEach(file => {
            fs.unlink(path.join(__dirname, '..', file.path), err => {
                if (err) console.error(`Error deleting temp file ${file.path}:`, err);
            });
        });

        // Create the listing with uploaded image URLs
        const newListing = await Listing.create({
            title,
            description,
            price,
            category,
            images: imageUrls,
            postedBy: userId,
            location: location,
        });

        await User.findByIdAndUpdate(userId, { $push: { listings: newListing._id } });

        return res.status(201).json(new ApiResponse('Listing created successfully', newListing));
    } catch (error) {
        console.log(error);
        throw new CustomApiError(500, 'Server error while creating listing');
    }
});

const GetAllListings = asyncHandler(async (req, res) => {
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
            throw new CustomApiError(404, 'No listings found');
        }
    
        return res.status(200).json(new ApiResponse('Listings fetched successfully', listings));
    } catch (error) {
        console.error('Error fetching listings:', error);
        throw new CustomApiError(500, 'Server error while fetching listings');
    }
});

const GetSingleListing = asyncHandler(async (req, res) => {          
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate('postedBy', 'fullname email');
        
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }
        
        // Check if the listing is bookmarked by the current user
        let isBookmarked = false;
        if (req.user) {
            const user = await User.findById(req.user._id);
            if (user && user.Bookmarks) {
                isBookmarked = user.Bookmarks.includes(listing._id);
            }
        }
        
        return res.status(200).json(
            new ApiResponse('Listing fetched successfully', {
                listing: listing,
                isBookmarked: isBookmarked,
                user: req.user
            })
        );
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while fetching listing');
    }
});

const UpdateListing = asyncHandler(async (req, res) => {
    try {
        // Check if the user is the owner of the listing
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }
        
        if (listing.postedBy.toString() !== req.user._id.toString()) {
            throw new CustomApiError(403, 'You are not authorized to update this listing');
        }

        const { id } = req.params;
        const { title, description, price, category, location } = req.body;

        // Handle file uploads if any
        let imageUrls = listing.images; // Keep existing images by default
        
        if (req.files && req.files.length > 0) {
            // Upload new images
            const imageUploadPromises = req.files.map(file => uploadFile(file.path));
            const uploadedImages = await Promise.all(imageUploadPromises);
            imageUrls = uploadedImages.map(img => img.secure_url);
            
            // Clean up temp files after upload
            req.files.forEach(file => {
                fs.unlink(path.join(__dirname, '..', file.path), err => {
                    if (err) console.error(`Error deleting temp file ${file.path}:`, err);
                });
            });
        }

        // Find the listing by ID and update it
        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { 
                title, 
                description, 
                price, 
                category, 
                location,
                ...(req.files && req.files.length > 0 ? { images: imageUrls } : {})
            },
            { new: true }
        );

        if (!updatedListing) {
            throw new CustomApiError(404, 'Listing not found');
        }

        return res.status(200).json(new ApiResponse('Listing updated successfully', updatedListing));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while updating listing');
    }
});

const DeleteListing = asyncHandler(async (req, res) => {   
    try {
        // Check if the listing exists
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }
        
        // Check if the user is the owner of the listing
        if (listing.postedBy.toString() !== req.user._id.toString()) {
            throw new CustomApiError(403, 'You are not authorized to delete this listing');
        }
        
        // Check if the listing is already sold
        if (listing.isSold) {
            throw new CustomApiError(400, 'Cannot delete a sold listing');
        }

        // Delete the listing
        await Listing.findByIdAndDelete(req.params.id);

        // Remove the listing from the user's listings array
        await User.findByIdAndUpdate(req.user._id, { $pull: { listings: req.params.id } });

        return res.status(200).json(new ApiResponse('Listing deleted successfully', null));
    } catch (error) {
        throw new CustomApiError(500, 'Server error while deleting listing');
    }
});

const GetUserListings = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const listings = await Listing.find({ postedBy: userId }).populate('postedBy', 'name email').sort({ createdAt: -1 });
        
        return res.status(200).json(new ApiResponse('User listings fetched successfully', {
            listings: listings
        }));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while fetching user listings');
    }
});

const GetUserListingById = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const listing = await Listing.findOne({ _id: id, postedBy: userId }).populate('postedBy', 'name email');
        
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }
        
        return res.status(200).json(new ApiResponse('User listing fetched successfully', listing));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while fetching user listing');
    }
});

const AddToBookmarks = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }

        // Add the listing to the user's bookmarks
        await User.findByIdAndUpdate(userId, { $addToSet: { Bookmarks: listingId } });

        return res.status(200).json(new ApiResponse('Listing added to bookmarks', null));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while adding to bookmarks');
    }
});

const RemoveFromBookmarks = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }

        // Remove the listing from the user's bookmarks
        await User.findByIdAndUpdate(userId, { $pull: { Bookmarks: listingId } });

        return res.status(200).json(new ApiResponse('Listing removed from bookmarks', null));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while removing from bookmarks');
    }
});  

const GetUserBookmarks = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('Bookmarks');
        
        if (!user) {
            throw new CustomApiError(404, 'User not found');
        }
        
        return res.status(200).json(new ApiResponse('User bookmarks fetched successfully', user.Bookmarks));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while fetching user bookmarks');
    }
});

const ToggleBookmark = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            throw new CustomApiError(404, 'Listing not found');
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            throw new CustomApiError(404, 'User not found');
        }

        // Check if the listing is already bookmarked
        const isBookmarked = user.Bookmarks && user.Bookmarks.includes(listing._id);

        if (isBookmarked) {
            // Remove from bookmarks
            await User.findByIdAndUpdate(userId, { $pull: { Bookmarks: listing._id } });
        } else {
            // Add to bookmarks
            await User.findByIdAndUpdate(userId, { $addToSet: { Bookmarks: listing._id } });
        }

        return res.status(200).json(new ApiResponse(
            isBookmarked ? 'Listing removed from bookmarks' : 'Listing added to bookmarks',
            { isBookmarked: !isBookmarked }
        ));
    } catch (error) {
        console.error(error);
        throw new CustomApiError(500, 'Server error while toggling bookmark');
    }
});

module.exports = { 
    CreateListing,
    GetAllListings, 
    GetSingleListing, 
    UpdateListing, 
    DeleteListing, 
    GetUserListings,
    GetUserListingById,
    AddToBookmarks,
    RemoveFromBookmarks,
    GetUserBookmarks,
    ToggleBookmark
};
