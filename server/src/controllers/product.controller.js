const Product = require('../models/Product');
const Store   = require('../models/Store');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category)  query.category = category;
    if (search)    query.title = { $regex: search, $options: 'i' };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ products, total, pages: Math.ceil(total / limit) });
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
    const product = await Product.create({ ...req.body, store: store._id });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product;
    if (req.user.role === 'admin') {
      product = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    } else {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(403).json({ message: 'No store found for your account.' });
      product = await Product.findOneAndUpdate(
        { _id: req.params.id, store: store._id },
        req.body,
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
