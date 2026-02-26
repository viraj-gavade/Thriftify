/**
 * @fileoverview Order schema for Thriftify marketplace
 * Defines the data structure for orders with payment and shipping details
 */

// Mongoose ODM for MongoDB schema definition and validation
const mongoose = require('mongoose');

/**
 * Schema for marketplace orders
 * Tracks the entire order lifecycle including payment and shipping status
 */
const OrderSchema = new mongoose.Schema(
    {
        // Reference to the purchased listing
        listing: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Listing" 
        },
        
        // Reference to the buyer (user who placed the order)
        buyer: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        },
        
        // Reference to the seller (user who posted the listing)
        seller: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        },
        
        // Optional reference to transaction details
        transaction: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Transaction" 
        },
      
        // Order status throughout fulfillment lifecycle
        orderStatus: {
            type: String,
            enum: ['pending', "placed", "confirmed", "cancelled", "shipped", "delivered"],
            default: "placed"
        },
      
        // Shipping details for order delivery
        shippingInfo: {
            name: String,
            address: String,
            phone: String,
            city: String,
            pincode: String
        },

        // Payment details including gateway information
        paymentInfo: {
            id: String,
            status: String,
            amount: Number,
            currency: String,
            method: {
                type: String,
                enum: ["paypal", "razorpay"],
                default: "paypal"
            },
        },
        
        // PayPal specific order identifier
        paypalOrderId: { type: String }, 

        // Payment status flag
        isPaid: { type: Boolean, default: false },

        // Timestamp when payment was completed
        paidAt: { type: Date },
      
        // Order placement timestamp
        placedAt: { type: Date, default: Date.now }
    }, 
    { timestamps: true }
);

const OrderModel = mongoose.model('Order', OrderSchema);
module.exports = OrderModel;