const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        unique: true,   
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },


}, { timestamps: true });

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;