/**
 * @fileoverview Listing schema for product listings in Thriftify marketplace
 * Defines the data structure for product listings including validation and methods
 */

// Mongoose ODM for MongoDB schema definition and validation
const mongoose = require('mongoose');

/**
 * Schema for marketplace listings
 * Includes product details, pricing, categorization, and relationship data
 */
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

/**
 * Checks if a listing is bookmarked by a specific user
 * 
 * @param {string} userId - MongoDB ObjectId of the user to check
 * @returns {boolean} True if the listing is bookmarked by the user
 */
ListingSchema.methods.isBookmarkedBy = function(userId) {
    return this.bookmarkedBy.includes(userId);
};

const ListingModel = mongoose.model('Listing', ListingSchema);
module.exports = ListingModel;