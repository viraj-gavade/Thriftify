/**
 * @fileoverview Search controller for Thriftify application
 * Handles search functionality with filters
 */

const Listing = require('../Schemas/listings.schemas');
const asyncHandler = require('../utils/asynchandler');
const CustomApiError = require('../utils/apiErrors');
const ApiResponse = require('../utils/apiResponse');

/**
 * Search listings by query string and optional filters
 */
const searchListings = asyncHandler(async (req, res) => {
    try {
        // Extract search parameters
        const query = req.query.query || '';
        const category = req.query.category || '';
        const location = req.query.location || '';
        const sortBy = req.query.sortBy || 'newest';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        
        // Build search query with case-insensitive matching
        const searchQuery = {};
        
        // Only add text search if query parameter exists and is not empty
        if (query && query.trim() !== '') {
            searchQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        
        // Add optional filters if provided
        if (category) {
            searchQuery.category = category;
        }
        
        if (location) {
            searchQuery.location = location;
        }
        
        // Determine sort options
        let sortOptions = { createdAt: -1 }; // Default to newest first
        
        switch(sortBy) {
            case 'oldest':
            case 'asc':
                sortOptions = { createdAt: 1 };
                break;
            case 'price-asc':
            case 'price_low':
                sortOptions = { price: 1 };
                break;
            case 'price-desc':
            case 'price_high':
                sortOptions = { price: -1 };
                break;
            default:
                sortOptions = { createdAt: -1 };
        }
        
        // Get categories and locations for filter options
        const categories = await Listing.distinct('category');
        const locations = await Listing.distinct('location');
        
        // Execute search query to get total for pagination
        const total = await Listing.countDocuments(searchQuery);
        
        // Execute search query to get listings
        const listings = await Listing.find(searchQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('postedBy', 'fullname email');
        
        // Try to get user's bookmarks if they're logged in
        let userBookmarks = [];
        if (req.user) {
            try {
                const User = require('../Schemas/user.schemas');
                const user = await User.findById(req.user._id).select('Bookmarks');
                if (user && user.Bookmarks) {
                    userBookmarks = user.Bookmarks.map(b => ({ listingId: b.toString() }));
                }
            } catch (err) {
                // bookmarks lookup is non-critical
            }
        }
        

        // Return API response with search results data
        return res.status(200).json(
            new ApiResponse(
                'Search results fetched successfully',
                {
                    title: query ? `Search results for "${query}" | Thriftify` : 'Search Results | Thriftify',
                    listings: listings,
                    categories: categories,
                    locations: locations,
                    userBookmarks: userBookmarks,
                    filters: {
                        query: query,
                        category: category,
                        location: location,
                        sortBy: sortBy
                    },
                    pagination: {
                        page: page,
                        limit: limit,
                        total: total,
                        pages: Math.ceil(total / limit)
                    },
                    query: query,
                    user: req.user
                }
            )
        );
    } catch (error) {
        console.error('Search error:', error);
        throw new CustomApiError(500, 'An error occurred while searching');
    }
});

module.exports = {
    searchListings
};
