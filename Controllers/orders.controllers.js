
const CustomApiError = require('../utils/apiErrors') // Custom error handling class
const ApiResponse = require('../utils/apiResponse') // Custom error handling class
const Order = require('../Schemas/order.schemas') // Order model for database operations
const Listing = require('../Schemas/listings.schemas') // Listing model for database operations
const asyncHandler = require('../utils/asynchandler') // Middleware for handling async errors in Express



const CreateOrder = asyncHandler( async (req, res) => {   
    try {   

        const userId = req.user._id; // Extracting user ID from request object
        if (!userId) {
            throw new CustomApiError('User not authenticated', 401); // Custom error if user is not authenticated
        }
        const { listingId,name , address , phone , city , pincode } = req.body; // Extracting order details from request body
        const listing = await Listing.findById(listingId);
        if (!listing) {
            throw new CustomApiError('Listing not found', 404); // Custom error if listing not found
        }
        const order = await Order.create({ 
            listing: listingId,
            buyer: userId,
            seller: listing.postedBy,
            shippingInfo: {
                name,
                address,
                phone,
                city,
                pincode
            }
        });
        if (!order) {
            throw new CustomApiError('Order creation failed', 500); // Custom error if order creation fails
        }
        // Updating the listing with the order ID
        await Listing.findByIdAndUpdate(listingId,{isSold: true, order: order._id}, { new: true });
        // Updating the order with the listing ID
        return res.status(201).json(new ApiResponse('Order created successfully', order)); // Sending success response with order details
    } catch (error) {
        console.error(error); // Logging error to console
        return res.status(error.statusCode || 500).json(new ApiResponse(error.message || 'Internal Server Error')); // Sending error response
    }

         }); 

module.exports = {
    CreateOrder
}