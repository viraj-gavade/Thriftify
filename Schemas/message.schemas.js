const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
   chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },

    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });


const MessageModel = mongoose.model('Message', messageSchema);
module.exports = MessageModel;  

