
const CustomApiError = require('../utils/apiErrors') // Custom error handling class
const ApiResponse = require('../utils/apiResponse') // Custom error handling class
const Order = require('../Schemas/order.schemas') // Order model for database operations
const Listing = require('../Schemas/listings.schemas') // Listing model for database operations
const asyncHandler = require('../utils/asynchandler') // Middleware for handling async errors in Express
const User = require('../Schemas/user.schemas') // User model for database operations


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
        await User.findByIdAndUpdate(userId, { $addToSet: { orders: order._id } }, { new: true });
        await User.findByIdAndUpdate(listing.postedBy, { $addToSet: { orders: order._id } }, { new: true });
        return res.status(201).json(new ApiResponse('Order created successfully', order)); // Sending success response with order details
    } catch (error) {
        console.error(error); // Logging error to console
        return res.status(error.statusCode || 500).json(new ApiResponse(error.message || 'Internal Server Error')); // Sending error response
    }

         }); 

const GetOrder = asyncHandler(async (req, res) => { 
    const orderId = req.params.id; // Extracting order ID from request parameters   
    const order = await Order.findById(orderId).populate('listing').populate('buyer').populate('seller'); // Fetching order details from database
    if (!order) {
        return res.status(404).json(new ApiResponse('Order not found')); // Sending error response if order not found
    }
    return res.status(200).json(new ApiResponse('Order fetched successfully', order)); // Sending success response with order details
}
    
    )

const GetUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Extracting user ID from request object
    const orders = await Order.find({ buyer: userId }).populate('listing'); // Fetching orders for the user
    if (!orders) {
        return res.status(404).json(new ApiResponse('No orders found')); // Sending error response if no orders found
    }
    return res.status(200).json(new ApiResponse('Orders fetched successfully', orders)); // Sending success response with orders
}
)

const DeleteUserOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Extracting user ID from request object
    if (!userId) {
        return res.status(401).json(new ApiResponse('User not authenticated')); // Sending error response if user is not authenticated
    }
    const {orderId} = req.body; // Extracting order ID from request parameters
    const order = await Order.findByIdAndDelete(orderId); // Deleting order from database
    if (!order) {
        return res.status(404).json(new ApiResponse('Order not found')); // Sending error response if order not found
    }
    // Updating the listing to mark it as unsold
    await Listing.findByIdAndUpdate(order.listing, { isSold: false }, { new: true });
    // Removing the order from the user's orders array
    await User.findByIdAndUpdate(order.buyer, { $pull: { orders: orderId } }, { new: true });
    await User.findByIdAndUpdate(order.seller, { $pull: { orders: orderId } }, { new: true });
    return res.status(200).json(new ApiResponse('Order deleted successfully')); // Sending success response

}
)



module.exports = {
    CreateOrder,
    GetOrder,
    GetUserOrders,
    DeleteUserOrder
}