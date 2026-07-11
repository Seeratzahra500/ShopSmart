const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  passwordHash:     { type: String, required: true },
  role:             { type: String, enum: ['customer', 'shopowner', 'admin'], default: 'customer' },
  isActive:         { type: Boolean, default: true },
  resetToken:       String,
  resetTokenExpiry: Date,
  // Bumped on logout, password reset, and deactivation to invalidate all
  // outstanding refresh tokens for this user without needing a token blacklist.
  tokenVersion:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
