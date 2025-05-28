const CustomApiError = require('../utils/apiErrors') // Custom error handling class
const ApiResponse = require('../utils/apiResponse') // Custom error handling class
const Order = require('../Schemas/order.schemas') // Order model for database operations
const Listing = require('../Schemas/listings.schemas') // Listing model for database operations
const asyncHandler = require('../utils/asynchandler') // Middleware for handling async errors in Express
const User = require('../Schemas/user.schemas') // User model for database operations


const axios = require("axios");


// Simple in-memory token cache (reset on server restart)
let paypalAccessToken = null;
let paypalTokenExpiry = null;

// Util: Get PayPal Access Token with caching
const getPaypalAccessToken = async () => {
  try {
    const now = new Date().getTime();
    if (paypalAccessToken && paypalTokenExpiry && now < paypalTokenExpiry) {
      return paypalAccessToken; // still valid
    }

    const basicAuth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    paypalAccessToken = tokenRes.data.access_token;
    paypalTokenExpiry = now + tokenRes.data.expires_in * 1000 - 60 * 1000; // refresh 1 min early
    return paypalAccessToken;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    throw new CustomApiError(500, "Failed to get payment authorization token");
  }
};

const CreateOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new CustomApiError(401, "User not authenticated");

    const { listingId, name, address, phone, city, pincode } = req.body;

    if (!listingId || !name || !address || !phone || !city || !pincode) {
      throw new CustomApiError(400, "All shipping fields are required");
    }

    const listing = await Listing.findById(listingId);
    if (!listing) throw new CustomApiError(404, "Listing not found");
    if (listing.isSold) throw new CustomApiError(409, "Listing already sold");

    // Get the base URL with proper format (ensure it has http/https prefix)
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    // Make sure baseUrl starts with http:// or https://
    const formattedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
    const accessToken = await getPaypalAccessToken();

    const orderRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: (parseFloat(listing.price) / 70).toFixed(2), // Use real currency API in production
            },
            description: `Purchase of ${listing.title} on Thriftify`,
          },
        ],
        application_context: {
          return_url: `${formattedBaseUrl}/success`,
          cancel_url: `${formattedBaseUrl}/cancel`,
          brand_name: "Thriftify",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paypalOrderId = orderRes.data.id;

    const order = await Order.create({
      listing: listingId,
      buyer: userId,
      seller: listing.postedBy,
      paypalOrderId,
      shippingInfo: {
        name,
        address,
        phone,
        city,
        pincode,
      },
      paymentInfo: {
        orderId: paypalOrderId,
        status: "pending",
        amount: listing.price,
        currency: "USD",
        method: "paypal",
      },
      isPaid: false,
      orderStatus: "pending",
    });

    if (!order) throw new CustomApiError(500, "Order creation failed");

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { orders: order._id } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      listing.postedBy,
      { $addToSet: { orders: order._id } },
      { new: true }
    );

    return res.status(201).json(
      new ApiResponse("Order created successfully", {
        order,
        paypalOrderId,
        paypalLink: orderRes.data.links.find((l) => l.rel === "approve")?.href,
      })
    );
  } catch (error) {
    console.error("Order creation error:", error);
    if (error instanceof CustomApiError) {
      throw error;
    }
    throw new CustomApiError(error.statusCode || 500, error.message || "Internal Server Error");
  }
});

// Capture the PayPal payment after approval
const capturePayment = asyncHandler(async (req, res) => {
    try {
      const { token } = req.query; // we get ?token=... from PayPal redirect
      if (!token) throw new CustomApiError(400, "Missing PayPal token in query");
    
      // Reuse the existing token function instead of duplicating code
      const accessToken = await getPaypalAccessToken();
    
      // Step 2: Capture the payment using the token
      const captureRes = await axios.post(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    
      const captureData = captureRes.data;  
      if (captureRes.status !== 201 || captureData.status !== "COMPLETED") {
        throw new CustomApiError(500, "Payment not completed");
      }
    
      // Step 3: Find and update your order in DB
      const updatedOrder = await Order.findOneAndUpdate(
        { paypalOrderId: token },
        {
          paymentInfo: {
            orderId: token,
            status: "completed",
            amount: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "0",
            currency: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code || "USD",
            method: "paypal",
          },
          isPaid: true,
          orderStatus: "confirmed",
          paidAt: Date.now()
        },
        { new: true }
      ).populate('listing');
    
      if (!updatedOrder) {
        throw new CustomApiError(404, "Order not found for the given PayPal token");
      }

      // Also mark the listing as sold when payment is complete
      await Listing.findByIdAndUpdate(
        updatedOrder.listing._id, 
        { isSold: true }, 
        { new: true }
      );      
      
      // Return success response with payment details instead of redirecting
      return res.status(200).json(
        new ApiResponse("Payment captured successfully", {
          order: updatedOrder,
          redirectUrl: '/payment-success' // Include redirect URL for client to use
        })
      );
    } catch (err) {
      console.error("❌ Capture failed:", err.response?.data || err.message);
      // Return error response with redirect info instead of redirecting directly
      return res.status(err.statusCode || 500).json(
        new ApiResponse("Payment capture failed", {
          error: err.message || "Payment processing error",
          redirectUrl: '/payment-cancel' // Include redirect URL for client to use
        }, false)
      );
    }
});

/**
 * Retrieves a specific order by ID
 * 
 * @param {Object} req - Express request object containing order ID in params
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with order details or error
 */
const GetOrder = asyncHandler(async (req, res) => {
  try { 
    const orderId = req.params.id; // Extracting order ID from request parameters   
    const order = await Order.findById(orderId).populate('listing').populate('buyer').populate('seller'); // Fetching order details from database
    
    if (!order) {
      throw new CustomApiError(404, 'Order not found');
    }
    
    return res.status(200).json(new ApiResponse('Order fetched successfully', order));
  } catch (error) {
    console.error("Error fetching order:", error);
    if (error instanceof CustomApiError) {
      throw error;
    }
    throw new CustomApiError(500, "Error retrieving order details");
  }
});

const GetUserOrders = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Extracting user ID from request object
    if (!userId) {
      throw new CustomApiError(401, 'User not authenticated');
    }
    
    const orders = await Order.find({ buyer: userId }).populate('listing'); // Fetching orders for the user
    
    // Return the orders even if the array is empty (don't throw error for empty results)
    return res.status(200).json(new ApiResponse('Orders fetched successfully', orders));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    if (error instanceof CustomApiError) {
      throw error;
    }
    throw new CustomApiError(500, "Error retrieving orders");
  }
});

const DeleteUserOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Extracting user ID from request object
    if (!userId) {
      throw new CustomApiError(401, 'User not authenticated');
    }
    
    const {orderId} = req.params; // Extracting order ID from request parameters
    
    // First find the order to check permissions
    const orderToDelete = await Order.findById(orderId);
    if (!orderToDelete) {
      throw new CustomApiError(404, 'Order not found');
    }
    
    // Only allow buyer to delete their own orders
    if (orderToDelete.buyer.toString() !== userId.toString()) {
      throw new CustomApiError(403, 'Not authorized to delete this order');
    }
    
    // Delete the order
    const order = await Order.findByIdAndDelete(orderId);
    
    // Updating the listing to mark it as unsold
    await Listing.findByIdAndUpdate(order.listing, { isSold: false }, { new: true });
    
    // Removing the order from the user's orders array
    await User.findByIdAndUpdate(order.buyer, { $pull: { orders: orderId } }, { new: true });
    await User.findByIdAndUpdate(order.seller, { $pull: { orders: orderId } }, { new: true });
    
    return res.status(200).json(
      new ApiResponse('Order deleted successfully', order)
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    if (error instanceof CustomApiError) {
      throw error;
    }
    throw new CustomApiError(500, "Error deleting order");
  }
});

const ViewOrderDetails = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        if (!req.user) {
          throw new CustomApiError(401, 'Unauthorized access');
        }
        
        const order = await Order.findById(orderId)
            .populate('listing')
            .populate('buyer', 'fullname email')
            .populate('seller', 'fullname email');
        
        if (!order) {
            throw new CustomApiError(404, 'Order not found');
        }

        // Check if the requesting user is either the buyer or seller
        if (req.user._id.toString() !== order.buyer._id.toString() && 
            req.user._id.toString() !== order.seller._id.toString()) {
            throw new CustomApiError(403, 'You do not have permission to view this order');
        }

        // Format dates for display
        const formattedOrder = {
            ...order.toObject(),
            createdAt: new Date(order.createdAt).toLocaleString(),
            updatedAt: new Date(order.updatedAt).toLocaleString(),
            placedAt: order.placedAt ? new Date(order.placedAt).toLocaleString() : null,
            paidAt: order.paidAt ? new Date(order.paidAt).toLocaleString() : null
        };

        // Return API response with order details instead of rendering
        return res.status(200).json(
          new ApiResponse('Order details fetched successfully', {
            title: `Order #${orderId.substring(0, 8)}... | Thriftify`,
            order: formattedOrder,
            user: req.user
          })
        );
    } catch (error) {
        console.error('Error fetching order details:', error);
        if (error instanceof CustomApiError) {
          throw error;
        }
        throw new CustomApiError(500, 'Error retrieving order details');
    }
});

module.exports = {
    CreateOrder,
    GetOrder,
    GetUserOrders,
    DeleteUserOrder,
    capturePayment,
    ViewOrderDetails
}