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
        set: function(value) {
            if (value) return value.toLowerCase();
            return value;
        },
        get: function(value) {
            return value;
        }
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
    bookmarkedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
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

// Add a method to check if a user has bookmarked this listing
ListingSchema.methods.isBookmarkedBy = function(userId) {
    return this.bookmarkedBy.includes(userId);
};

const ListingModel = mongoose.model('Listing', ListingSchema);
module.exports = ListingModel;