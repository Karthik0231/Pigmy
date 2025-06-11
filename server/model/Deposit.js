const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PigmyPlan",
    required: true,
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collector",
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ["in_hand", "online"],
    required: true,
  },
  referenceId: {
    type: String,
  },
  depositDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: function() {
      return this.paymentMethod === "online" ? "approved" : "pending";
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collector",
  },
  approvedAt: {
    type: Date,
  },
  rejectedReason: {
    type: String,
  },
  // Flag to track if balance has been updated
  balanceUpdated: {
    type: Boolean,
    default: false,
  },
  // Metadata for tracking
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Pre-save middleware to update timestamps
depositSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set approvedAt when status changes to approved
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = Date.now();
  }
  
  next();
});

module.exports = mongoose.model("Deposit", depositSchema);