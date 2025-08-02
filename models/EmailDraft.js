const mongoose = require('mongoose');

const emailDraftSchema = new mongoose.Schema({
  originalEmailId: { type: String, required: true },
  originalSubject: String,
  originalFrom: String,
  draftSubject: String,
  draftContent: { type: String, required: true },
  aiModel: { type: String, default: 'gemini-pro' },
  generatedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'edited', 'discarded'], 
    default: 'draft' 
  },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  context: String, // Optional context used for generation
  category: String // Email category that triggered the draft
}, { timestamps: true });

// Index for quick lookups
emailDraftSchema.index({ originalEmailId: 1, account: 1 });
emailDraftSchema.index({ generatedAt: -1 });
emailDraftSchema.index({ status: 1 });

module.exports = mongoose.model('EmailDraft', emailDraftSchema);
