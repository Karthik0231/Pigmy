// models/PigmyPlan.js
const mongoose = require('mongoose');

const PigmyPlanSchema = new mongoose.Schema({
  plan_name: {
    type: String,
    required: true,
    trim: true
  },
  deposit_frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  deposit_amount: {
    type: Number,
    required: true,
    min: 1
  },
  duration_months: {
    type: Number,
    required: true,
    min: 1
  },
  interest_rate: {
    type: Number,
    required: true,
    min: 0
  },
  maturity_amount: {
    type: Number,
    required: true,
    min: 1
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PigmyPlan', PigmyPlanSchema);
