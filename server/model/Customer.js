const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  // Basic details
  name: { type: String, required: true },
  email: { type: String },  // REMOVE unique
  phone: { type: String, required: true }, // REMOVE unique
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
  dob: { type: Date },
  address: { type: String, required: true },
  password: { type: String, required: true },

  // Account details
  accountNumber: { type: String, required: true, unique: true },
  accountType: { type: String, enum: ['daily', 'weekly'], required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PigmyPlan', required: true },
  startDate: { type: Date, default: Date.now },
  maturityDate: { type: Date },
  balance: { type: Number, default: 0 },
  isClosed: { type: Boolean, default: false },

  // Collector relationship
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector', required: true },

  // Image & documents
  profileImage: { type: String },
  kycDocs: {
    aadhar: { type: String },
    pan: { type: String }
  },

  // Withdrawal requests
  withdrawalRequests: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' },
      remarks: { type: String }
    }
  ],
  lastDepositDate: { type: Date },

  // Admin control fields
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Customer", customerSchema);