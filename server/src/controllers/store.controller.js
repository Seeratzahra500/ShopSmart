const Store   = require('../models/Store');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const { escapeRegex } = require('../utils/sanitize');

const MAX_LIMIT = 100;
// Slugs must not collide with static path segments used by store.routes.js
// (e.g. /api/store/analytics would otherwise be shadowed by /api/store/:slug).
const RESERVED_SLUGS = ['default', 'analytics', 'products', 'mine', 'me', 'admin', 'api'];
const SLUG_PATTERN = /^[a-z0-9-]{3,40}$/;

function validateSlug(slug) {
  if (!SLUG_PATTERN.test(slug)) return 'Slug must be 3-40 characters, lowercase letters, numbers, and hyphens only.';
  if (RESERVED_SLUGS.includes(slug)) return 'That slug is reserved.';
  return null;
}

// GET /api/stores — public list of all active stores
exports.listStores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const clampedLimit = Math.min(Number(limit) || 12, MAX_LIMIT);
    const query = { isActive: true };
    if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };

    const total  = await Store.countDocuments(query);
    const stores = await Store.find(query)
      .select('name tagline slug logoUrl primaryColor theme gridColumns')
      .skip((page - 1) * clampedLimit)
      .limit(clampedLimit)
      .sort({ createdAt: -1 });

    res.json({ stores, total, pages: Math.ceil(total / clampedLimit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/stores/:slug/products — public, store-scoped product list
exports.getStoreProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, isActive: true });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const { category, search, page = 1, limit = 12 } = req.query;
    const clampedLimit = Math.min(Number(limit) || 12, MAX_LIMIT);
    const query = { store: store._id, isActive: true };
    if (category) query.category = category;
    if (search)   query.title = { $regex: escapeRegex(search), $options: 'i' };

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * clampedLimit)
      .limit(clampedLimit)
      .sort({ createdAt: -1 });

    res.json({ products, total, pages: Math.ceil(total / clampedLimit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/stores/:slug/products/:id — public, single product scoped to store
exports.getStoreProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, isActive: true });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const product = await Product.findOne({ _id: req.params.id, store: store._id, isActive: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/store/mine — return shopowner's store, auto-create if first time
exports.getMine = async (req, res) => {
  try {
    let store = await Store.findOne({ owner: req.user.id });
    if (!store) {
      store = await Store.create({
        owner: req.user.id,
        name:  'My ShopSmart Store',
        slug:  `store-${req.user.id.toString().slice(-6)}`,
      });
    }
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/stores/:slug — public, get by slug
exports.getBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, isActive: true }).select('-owner');
    if (!store) return res.status(404).json({ message: 'Store not found.' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/store/products — shopowner's own products (all, incl. inactive)
exports.getOwnProducts = async (req, res) => {
  try {
    const store = req.store;
    const { page = 1, limit = 100, search } = req.query;
    const clampedLimit = Math.min(Number(limit) || 100, MAX_LIMIT);
    const query = { store: store._id };
    if (search) query.title = { $regex: escapeRegex(search), $options: 'i' };

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * clampedLimit)
      .limit(clampedLimit)
      .sort({ createdAt: -1 });

    res.json({ products, total, pages: Math.ceil(total / clampedLimit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/store/analytics — shopowner store-scoped analytics
exports.getAnalytics = async (req, res) => {
  try {
    const store = req.store;
    const totalOrders = await Order.countDocuments({ store: store._id });
    const revenueAgg  = await Order.aggregate([
      { $match: { store: store._id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const lowStock    = await Product.find({ store: store._id, stock: { $lt: 10 }, isActive: true }, 'title stock');
    const topProducts = await Order.aggregate([
      { $match: { store: store._id } },
      { $unwind: '$items' },
      { $group: { _id: '$items.title', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStock,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/store/:id — update store settings
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOne({ _id: req.params.id, owner: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    if (req.body.slug !== undefined) {
      const slugError = validateSlug(req.body.slug);
      if (slugError) return res.status(400).json({ message: slugError });
    }

    const allowed = [
      'name', 'tagline', 'description', 'slug',
      'logoUrl', 'primaryColor', 'accentColor', 'fontFamily', 'theme', 'colorScheme',
      'heroImage', 'heroHeadline', 'heroCta', 'announcement', 'gridColumns',
      'contact', 'currency', 'locale', 'design',
    ];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) store[key] = req.body[key];
    });

    await store.save();
    res.json(store);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'That slug is already taken.' });
    res.status(500).json({ message: 'Server error.' });
  }
};
