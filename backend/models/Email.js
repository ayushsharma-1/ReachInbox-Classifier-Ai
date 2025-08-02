const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },
  subject: String,
  from: String,
  to: String,
  date: Date,
  body: String,
  folder: String,
  label: { 
    type: String, 
    enum: ['Important', 'Spam', 'Promotions', 'Social', 'Updates', 'Forums', 'Interested', 'Not Interested'],
    default: null
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  isRead: { type: Boolean, default: false },
  isStarred: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
}, {
  timestamps: true
});

// Text index for search
emailSchema.index({ subject: 'text', from: 'text', body: 'text' });

// Index for filtering by folder & account
emailSchema.index({ folder: 1, account: 1 });

// Index for label filtering
emailSchema.index({ label: 1, account: 1 });

module.exports = mongoose.model('Email', emailSchema);
