const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true,    },

    fullname: {
        type: String,
        required: true,
       
    },
    email: { 
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
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
    console.log(password, this.password);
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