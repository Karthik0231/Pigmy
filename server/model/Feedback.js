const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  // Source of the feedback (e.g., 'user', 'admin', 'collector')
  source: {
    type: String,
    enum: ['Customer', 'Collector'], // Includes user, admin, and collector
    required: true,
  },
  // Reference to the user, admin, or collector who submitted the feedback
  // Using refPath for polymorphic reference
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'source', // This tells Mongoose to use the 'source' field to determine the model
  },
  // Subject or title of the feedback
  type:{
    type:String,
    enum:['Complaint','Suggestion'],
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 100, // Optional: Limit subject length
  },
  // The main content of the feedback message
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // Optional rating (e.g., 1-5)
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  // Status of the feedback (e.g., 'new', 'in_progress', 'resolved')
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'archived', 'closed'],
    default: 'new',
  },
  // Any internal notes or responses related to the feedback
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Add index for faster querying by source and status
feedbackSchema.index({ source: 1, status: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;