const Product = require('../models/Product');
const Store   = require('../models/Store');
const { escapeRegex } = require('../utils/sanitize');

// Fields a shopowner/admin may set directly; anything else in req.body (store,
// averageRating, reviewCount, ...) is ignored to prevent mass-assignment.
const ALLOWED_PRODUCT_FIELDS = ['title', 'description', 'price', 'stock', 'category', 'images', 'isActive'];
function pickAllowedProductFields(body) {
  const out = {};
  for (const key of ALLOWED_PRODUCT_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

const MAX_LIMIT = 100;

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const clampedLimit = Math.min(Number(limit) || 12, MAX_LIMIT);
    const query = { isActive: true };
    if (category)  query.category = category;
    if (search)    query.title = { $regex: escapeRegex(search), $options: 'i' };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * clampedLimit)
      .limit(clampedLimit)
      .sort({ createdAt: -1 });

    res.json({ products, total, pages: Math.ceil(total / clampedLimit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive)
      return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(400).json({ message: 'Store not found. Visit Store Settings first.' });
    const product = await Product.create({ ...pickAllowedProductFields(req.body), store: store._id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product;
    const updates = pickAllowedProductFields(req.body);
    if (req.user.role === 'admin') {
      product = await Product.findByIdAndUpdate(req.params.id, updates, { returnDocument: 'after', runValidators: true });
    } else {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(403).json({ message: 'No store found for your account.' });
      product = await Product.findOneAndUpdate(
        { _id: req.params.id, store: store._id },
        updates,
        { returnDocument: 'after', runValidators: true }
      );
    }
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    } else {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(403).json({ message: 'No store found for your account.' });
      result = await Product.findOneAndUpdate({ _id: req.params.id, store: store._id }, { isActive: false });
    }
    if (!result) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
