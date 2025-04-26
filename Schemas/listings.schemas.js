const mongoose = require('mongoose');


const ListingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ['electronics', 'furniture', 'clothing', 'books', 'others'],
        required: true,
    },
    images: [String],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isSold: {
        type: Boolean,
        default: false,
    },
   
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    location: {
        type: String,
        required: true,
    },
}, { timestamps: true });


const ListingModel = mongoose.model('Listing', ListingSchema);
module.exports = ListingModel;