const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  messageId: { type: String, unique: true, required: true },
  subject: String,
  from: String,
  to: String,
  date: Date,
  body: String,
  folder: String,
  label: String,
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
});

// Text index for search
emailSchema.index({ subject: 'text', from: 'text', body: 'text' });

// Index for filtering by folder & account
emailSchema.index({ folder: 1, account: 1 });

module.exports = mongoose.model('Email', emailSchema);
