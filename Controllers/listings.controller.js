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
        console.error(error);
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



const GetSingleListing =asyncHandler( async (req, res) => {          
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate('postedBy', 'name email');
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        return res.status(200).render('listing', { listing: listing });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

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

        // Find the listing by ID and update it
        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { title, description, price, category, location },
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
})

const DeleteListing = asyncHandler( async (req, res) => {   
    try {
        // Check if the user is the owner of the listing
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        if (listing.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this listing' });
        }

        // Delete the listing
        await Listing.findByIdAndDelete(req.params.id);

        // Remove the listing from the user's listings array
        await User.findByIdAndUpdate(req.user._id, { $pull: { listings: req.params.id } });

        return res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}
)

const GetUserListings = asyncHandler( async (req, res) => {
    try {
        const userId = req.user._id;
        const listings = await Listing.find({ postedBy: userId }).populate('postedBy', 'name email').sort({ createdAt: -1 });
        return res.status(200).json(listings);
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








module.exports = { CreateListing,
    GetAllListings, 
    GetSingleListing, 
    UpdateListing, 
    DeleteListing, 
    GetUserListings,
    GetUserListingById,
    AddToBookmarks,
    RemoveFromBookmarks,
    GetUserBookmarks
 };
