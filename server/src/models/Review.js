const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  store:    { type: mongoose.Schema.Types.ObjectId, ref: 'Store',   required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  title:    { type: String, trim: true, default: '' },
  body:     { type: String, trim: true, default: '' },
}, { timestamps: true });

reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
