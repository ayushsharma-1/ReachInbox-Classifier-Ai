// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  provider: { type: String, required: true },
  oauthTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  imapConfig: {
    host: String,
    port: Number,
    secure: Boolean
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
