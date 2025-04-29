const User = require('../Schemas/user.schemas');
const Listing = require('../Schemas/listings.schemas');
const asyncHandler = require('../utils/asynchandler');
const CustomApiError = require('../utils/apiErrors');

// Toggle bookmark status for a listing
const toggleBookmark = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new CustomApiError(401, 'Unauthorized access!');
    }
    
    const userId = req.user._id;
    const { listingId } = req.params;
    
    // Find the listing
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
        throw new CustomApiError(404, 'Listing not found!');
    }
    
    // Check if user has already bookmarked this listing
    const userIndex = listing.bookmarkedBy.indexOf(userId);
    const isBookmarked = userIndex !== -1;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
        throw new CustomApiError(404, 'User not found!');
    }
    
    // Toggle bookmark status
    if (isBookmarked) {
        // Remove bookmark
        listing.bookmarkedBy.pull(userId);
        user.Bookmarks.pull(listingId);
    } else {
        // Add bookmark
        listing.bookmarkedBy.push(userId);
        user.Bookmarks.push(listingId);
    }
    
    // Save changes
    await Promise.all([listing.save(), user.save()]);
    
    return res.status(200).json({
        status: 'success',
        message: isBookmarked ? 'Bookmark removed' : 'Listing bookmarked',
        isBookmarked: !isBookmarked
    });
});

// Get all bookmarked listings for the logged-in user
const getBookmarkedListings = asyncHandler(async (req, res) => {
    // Check if user is authenticated
    if (!req.user) {
        throw new CustomApiError(401, 'Unauthorized access!');
    }
    
    const userId = req.user._id;
    
    // Find the user and populate bookmarks
    const user = await User.findById(userId).populate({
        path: 'Bookmarks',
        select: 'title description price images category isSold createdAt'
    });
    
    if (!user) {
        throw new CustomApiError(404, 'User not found!');
    }
    
    // Render the bookmarks page with the data
    return res.render('bookmarks', {
        title: 'My Bookmarks | Thriftify',
        user: req.user,
        bookmarks: user.Bookmarks
    });
});

module.exports = {
    toggleBookmark,
    getBookmarkedListings
};
