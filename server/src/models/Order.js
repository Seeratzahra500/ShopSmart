const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title:    String,
  price:    Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  store:       { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail:  String,
  // Lets an unauthenticated buyer look up their own order without exposing it to anyone with the ID.
  guestToken:  { type: String, select: false },
  items:       [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status:      {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  shippingAddress: {
    street:  String,
    city:    String,
    country: String,
    zip:     String,
  },
}, { timestamps: true });

orderSchema.index({ store: 1, createdAt: -1 });
orderSchema.index({ customer: 1 });

module.exports = mongoose.model('Order', orderSchema);
