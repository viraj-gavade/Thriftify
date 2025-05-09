const fs = require('fs');
const path = require('path');
const uploadFile = require('../utils/cloudinary');
const Listing = require('../Schemas/listings.schemas');
const User = require('../Schemas/user.schemas');
const asyncHandler = require('../utils/asynchandler');

const CreateListing = asyncHandler( async (req, res) => {
    try {
        const { title, description, price, category,location } = req.body;
        const userId = req.user._id;

        const existingListing = await Listing.findOne({ title, user: userId });
        if (existingListing) {
            return res.status(400).json({ message: 'Listing already exists' });
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

        return res.status(201).json(newListing);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
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
          return res.status(404).json({ message: 'No listings found' });
        }
    
        res.status(200).json(listings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error' });
      }
});



const GetSingleListing = asyncHandler(async (req, res) => {          
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate('postedBy', 'fullname email');
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        
        // Check if the listing is bookmarked by the current user
        let isBookmarked = false;
        if (req.user) {
            const user = await User.findById(req.user._id);
            if (user && user.Bookmarks) {
                isBookmarked = user.Bookmarks.includes(listing._id);
            }
        }
        
        return res.status(200).render('listing', { 
            listing: listing,
            isBookmarked: isBookmarked ,
            user: req.user // Pass the user object to the template

        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

const UpdateListing = asyncHandler( async (req, res) => {
    try {
        // Check if the user is the owner of the listing
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        
        if (listing.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this listing' });
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
            return res.status(404).json({ message: 'Listing not found' });
        }

        return res.status(200).json(updatedListing);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

/**
 * Deletes a listing from the database
 * 
 * This function handles the deletion of a listing with several checks:
 * 1. Verifies the listing exists
 * 2. Ensures the current user is the owner of the listing
 * 3. Prevents deletion of listings that have been marked as sold
 * 
 * After successful deletion, it also updates the user document to remove
 * the listing reference from their listings array.
 * 
 * @param {Object} req - Express request object containing listing ID in params and user in auth token
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error details
 */
const DeleteListing = asyncHandler(async (req, res) => {   
    try {
        // Check if the listing exists
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        
        // Check if the user is the owner of the listing
        if (listing.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this listing' });
        }
        
        // Check if the listing is already sold
        if (listing.isSold) {
            return res.status(400).json({ message: 'Cannot delete a sold listing' });
        }

        // Delete the listing
        await Listing.findByIdAndDelete(req.params.id);

        // Remove the listing from the user's listings array
        await User.findByIdAndUpdate(req.user._id, { $pull: { listings: req.params.id } });

        return res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});

const GetUserListings = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        const listings = await Listing.find({ postedBy: userId }).populate('postedBy', 'name email').sort({ createdAt: -1 });
        return res.render('userlistings', { listings: listings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})
const GetUserListingById = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        const { id } = req.params;
        const listing = await Listing.findOne({ _id: id, postedBy: userId }).populate('postedBy', 'name email');
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        return res.status(200).json(listing);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

const AddToBookmarks = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Add the listing to the user's bookmarks
        await User.findByIdAndUpdate(userId, { $addToSet: { Bookmarks: listingId } });

        return res.status(200).json({ message: 'Listing added to bookmarks' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})
const RemoveFromBookmarks = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Remove the listing from the user's bookmarks
        await User.findByIdAndUpdate(userId, { $pull: { Bookmarks: listingId } });

        return res.status(200).json({ message: 'Listing removed from bookmarks' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})  

const GetUserBookmarks = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate('Bookmarks');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }           
        return res.status(200).json(user.Bookmarks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}
)

const ToggleBookmark = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const { listingId } = req.body;

        // Check if the listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the listing is already bookmarked
        const isBookmarked = user.Bookmarks && user.Bookmarks.includes(listing._id);

        if (isBookmarked) {
            // Remove from bookmarks
            await User.findByIdAndUpdate(userId, { $pull: { Bookmarks: listing._id } });
            return res.status(200).json({ 
                success: true, 
                message: 'Listing removed from bookmarks',
                isBookmarked: false
            });
        } else {
            // Add to bookmarks
            await User.findByIdAndUpdate(userId, { $addToSet: { Bookmarks: listing._id } });
            return res.status(200).json({ 
                success: true, 
                message: 'Listing added to bookmarks',
                isBookmarked: true
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = { CreateListing,
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
