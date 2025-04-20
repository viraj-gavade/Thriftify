const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    ],
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
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


const ChatRoomModel = mongoose.model('ChatRoom', ChatRoomSchema);
module.exports = ChatRoomModel;