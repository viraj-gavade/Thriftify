/**
 * @fileoverview User schema for Thriftify marketplace
 * Defines the data structure for user accounts with authentication methods
 */

// Mongoose ODM for MongoDB schema definition and validation
const mongoose = require('mongoose');

// Bcrypt library for password hashing and comparison
const bcryptjs = require('bcryptjs');

// JWT library for token generation and verification
const jwt = require('jsonwebtoken');

/**
 * Schema for user accounts
 * Includes personal details, authentication data, and relationship references
 */
const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true,
        trim: true,
        minLength: [3, 'Username must be at least 3 characters'],
        maxLength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9.,_]+$/, 'Username can only contain letters, numbers and underscores']
    },

    fullname: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minLength: [2, 'Full name must be at least 2 characters'],
        maxLength: [50, 'Full name cannot exceed 50 characters']
    },
    email: { 
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [8, 'Password must be at least 8 characters'],
        // Note: Additional password strength validation is handled during registration
    },
    profilepic: {
        type: String || '',
        required: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    Bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
        },
    ],
    listings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
        },
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
    ],
    refreshToken: {
        type: String,
        default: null,
    },
}, { timestamps: true });

/**
 * Pre-save middleware to hash passwords
 * Only runs when password field is modified
 */
UserSchema.pre('save', async function (next) {
    // Skip hashing if password hasn't changed
    if (!this.isModified('password')) {
        return next();
    }

    // Generate salt and hash password
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
});

/**
 * Verifies if provided password matches stored hash
 * 
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches
 */
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

/**
 * Generates short-lived JWT access token
 * 
 * @returns {Promise<string>} JWT access token
 */
UserSchema.methods.createAccestoken = async function () {
    const accessToken = await jwt.sign({
        _id: this._id,
        username: this.username,
        fullname: this.fullname,
        email: this.email,
        profilepic: this.profilepic
    }, process.env.ACCESS_TOKEN_SECRETE, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
    return accessToken;
};

/**
 * Generates long-lived JWT refresh token
 * 
 * @returns {Promise<string>} JWT refresh token
 */
UserSchema.methods.createRefreshtoken = async function () {
    const refreshToken = jwt.sign({
        _id: this._id,
        username: this.username,
        fullname: this.fullname,
        email: this.email
    }, process.env.REFRESH_TOKEN_SECRETE, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    });
    return refreshToken;
};

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;