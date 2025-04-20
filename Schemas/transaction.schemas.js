const mongoose = require('mongoose');


const TransactionSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
    payemntId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });


const TransactionModel = mongoose.model('Transaction', TransactionSchema);
module.exports = TransactionModel;