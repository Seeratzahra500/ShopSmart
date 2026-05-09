const Review  = require('../models/Review');
const Product = require('../models/Product');
const Store   = require('../models/Store');

async function syncRating(productId) {
  const agg = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg   = agg[0] ? Math.round(agg[0].avg * 10) / 10 : 0;
  const count = agg[0]?.count ?? 0;
  await Product.findByIdAndUpdate(productId, { averageRating: avg, reviewCount: count });
}

// POST /api/stores/:slug/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, isActive: true });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const product = await Product.findOne({ _id: req.params.id, store: store._id, isActive: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

    const review = await Review.create({
      product:  product._id,
      store:    store._id,
      customer: req.user.id,
      rating,
      title:    title || '',
      body:     body  || '',
    });

    await syncRating(product._id);
    const populated = await review.populate('customer', 'name');
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/stores/:slug/products/:id/reviews
exports.getReviews = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, isActive: true });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const product = await Product.findOne({ _id: req.params.id, store: store._id, isActive: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    const { page = 1, limit = 10 } = req.query;
    const total   = await Review.countDocuments({ product: product._id });
    const reviews = await Review.find({ product: product._id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ reviews, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/stores/:slug/products/:id/reviews/:reviewId
exports.deleteReview = async (req, res) => {
  try {
    const query = { _id: req.params.reviewId };
    if (req.user.role !== 'admin') query.customer = req.user.id;

    const review = await Review.findOneAndDelete(query);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    await syncRating(review.product);
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
