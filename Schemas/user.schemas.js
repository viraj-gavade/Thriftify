const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },


}, { timestamps: true });


// Middleware to hash the user's password before saving to the database
UserSchema.pre('save', async function (next) {
    // If the password is not modified, skip hashing
    if (!this.isModified('password')) {
        return next();
    }

    // Generate a salt with 10 rounds
    const salt = await bcryptjs.genSalt(10);
    
    // Hash the password using the salt
    this.password = await bcryptjs.hash(this.password, salt);
    
    // Proceed to save the user
    next();
});

// Instance method to compare the provided password with the stored hashed password
UserSchema.methods.isPasswordCorrect = async function (password) {
    // Compare the plain text password with the hashed password in the database
    return await bcryptjs.compare(password, this.password);
};

// Instance method to generate an access token for the user
UserSchema.methods.createAccestoken = async function () {
    // Create a JWT access token containing user data (user ID, username, fullname, email)
    const accessToken = await jwt.sign({
        _id: this._id,
        username: this.username,
        fullname: this.fullname,
        email: this.email,
        profilepic: this.profilepic
    }, process.env.ACCESS_TOKEN_SECRETE, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY // Set the expiry time for the token
    });
    return accessToken; // Return the generated access token
};

// Instance method to generate a refresh token for the user
UserSchema.methods.createRefreshtoken = async function () {
    // Create a JWT refresh token containing more user data for better identification
    const refreshToken = jwt.sign({
        _id: this._id,
        username: this.username,
        fullname: this.fullname,
        email: this.email
    }, process.env.REFRESH_TOKEN_SECRETE, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY // Set the expiry time for the refresh token
    });
    return refreshToken; // Return the generated refresh token
};

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;