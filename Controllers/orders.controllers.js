
const CustomApiError = require('../utils/apiErrors') // Custom error handling class
const ApiResponse = require('../utils/apiResponse') // Custom error handling class
const Order = require('../Schemas/order.schemas') // Order model for database operations
const Listing = require('../Schemas/listings.schemas') // Listing model for database operations
const asyncHandler = require('../utils/asynchandler') // Middleware for handling async errors in Express
const User = require('../Schemas/user.schemas') // User model for database operations


const axios = require("axios");

const CreateOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) throw new CustomApiError("User not authenticated", 401);

    const { listingId, name, address, phone, city, pincode } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) throw new CustomApiError("Listing not found", 404);

    // 💰 Step 1: Get PayPal access token
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
    const accessToken = tokenRes.data.access_token;

    // 💰 Step 2: Create PayPal order
    const orderRes = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD", // or INR if you’ve enabled it
              value: listing.price, // Assuming listing has a price field
            },
          },
        ],
        application_context: {
            return_url: "http://localhost:3000/payment-success", // or your deployed frontend
            cancel_url: "http://localhost:3000/payment-cancel",  // same here
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

    // 🧾 Step 3: Store order in your DB
    const order = await Order.create({
      listing: listingId,
      buyer: userId,
      seller: listing.postedBy,
      paypalOrderId, // ✅ Save PayPal order ID for future reference
      shippingInfo: {
        name,
        address,
        phone,
        city,
        pincode,
      },
    });

    if (!order) throw new CustomApiError("Order creation failed", 500);

    await Listing.findByIdAndUpdate(
      listingId,
      { isSold: true, order: order._id },
      { new: true }
    );

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
    
    await Order.findByIdAndUpdate(
        order._id,
        {
          paymentInfo: {
            orderId: paypalOrderId,
            status: "pending",
            amount: listing.price,
            currency: "USD",
            method: "paypal",
          },
          isPaid: true,
          orderStatus: "placed"
        },
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
    console.error(error);
    return res
      .status(error.statusCode || 500)
      .json(new ApiResponse(error.message || "Internal Server Error"));
  }
});

// Capture the PayPal payment after approval
const capturePayment = asyncHandler(async (req, res) => {
    const { token } = req.query; // we get ?token=... from PayPal redirect
    if (!token) throw new CustomApiError("Missing PayPal token in query", 400);
  
    // Step 1: Get a new access token from PayPal
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
  
    const accessToken = tokenRes.data.access_token;
  
    try {
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
      if (captureRes.status !== 201 && captureData.status !== "COMPLETED") {
        throw new CustomApiError("Payment not completed", 500);
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
        },
        { new: true }
      );
  
      if (!updatedOrder) {
        throw new CustomApiError("Order not found for the given PayPal token", 404);
      }
  
      return res.status(200).json(new ApiResponse("✅ Payment captured successfully", updatedOrder));
    } catch (err) {
      console.error("❌ Capture failed:", err.response?.data || err.message);
      return res.status(500).json(new ApiResponse("Payment capture failed", null));
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
    DeleteUserOrder,
    capturePayment
}