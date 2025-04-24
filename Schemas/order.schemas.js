const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema(
    {
        listing: { type:mongoose.Schema.Types.ObjectId, ref: "Listing" },
        buyer: { type:mongoose.Schema.Types.ObjectId, ref: "User" },
        seller: { type:mongoose.Schema.Types.ObjectId, ref: "User" },
        transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }, // optional but clean
      
        orderStatus: {
          type: String,
          enum: ["placed", "cancelled", "shipped", "delivered"],
          default: "placed"
        },
      
        shippingInfo: {
          name: String,
          address: String,
          phone: String,
          city: String,
          pincode: String
        },

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
        paypalOrderId: { type: String }, 

        isPaid: { type: Boolean, default: false },
      
        placedAt: { type: Date, default: Date.now }
      }
    , { timestamps: true }      
);


const OrderModel = mongoose.model('Order', OrderSchema);
module.exports = OrderModel;