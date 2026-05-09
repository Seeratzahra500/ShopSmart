const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  store:       { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  stock:       { type: Number, required: true, min: 0, default: 0 },
  category:    { type: String, required: true },
  images:        [{ type: String }],
  isActive:      { type: Boolean, default: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount:   { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
