const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  tagline:     { type: String, default: '' },
  description: { type: String, default: '' },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  customDomain:{ type: String, unique: true, sparse: true },

  // Branding
  logoUrl:      { type: String, default: '' },
  primaryColor: { type: String, default: '#4f46e5' },
  accentColor:  { type: String, default: '#818cf8' },
  fontFamily: {
    type: String,
    enum: ['Inter', 'Playfair Display', 'Poppins', 'Lato', 'Montserrat', 'Merriweather', 'Raleway', 'Space Grotesk'],
    default: 'Inter',
  },
  theme: {
    type: String,
    enum: ['minimal', 'bold', 'elegant', 'playful'],
    default: 'minimal',
  },
  colorScheme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },

  // Home page
  heroImage:    { type: String, default: '' },
  heroHeadline: { type: String, default: '' },
  heroCta:      { type: String, default: 'Shop Now' },
  announcement: {
    text:     { type: String, default: '' },
    color:    { type: String, default: '#4f46e5' },
    isActive: { type: Boolean, default: false },
  },

  // Layout
  gridColumns: { type: Number, enum: [2, 3], default: 3 },

  // Contact & social
  contact: {
    email:     { type: String, default: '' },
    phone:     { type: String, default: '' },
    address:   { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    twitter:   { type: String, default: '' },
  },

  // Config
  currency: { type: String, default: 'PKR' },
  locale:   { type: String, default: 'ur-PK' },
  isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
