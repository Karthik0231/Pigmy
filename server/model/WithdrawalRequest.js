const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer', // Reference to the Customer model
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1 // Ensure withdrawal amount is positive
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // Possible statuses
        default: 'pending'
    },
    handledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collector', // Reference to the Collector model (or Admin if applicable)
        default: null // Null if pending
    },
    remarks: {
        type: String,
        default: '' // Reason for rejection or any notes
    },
    requirements: {
        type: String,
        default: '' // User's specific requirements
    },
    // You might add fields like paymentMethod (how the user wants to receive funds)
    // or transactionDetails (once processed) later if needed.
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;