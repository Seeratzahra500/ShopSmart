const Store = require('../models/Store');

// GET /api/store/mine — return admin's store, auto-create if first time
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

// GET /api/store/default — public, returns first active store
exports.getDefault = async (req, res) => {
  try {
    const store = await Store.findOne({ isActive: true }).select('-owner');
    if (!store) return res.status(404).json({ message: 'No store found.' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/store/:slug — public, get by slug
exports.getBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug, isActive: true }).select('-owner');
    if (!store) return res.status(404).json({ message: 'Store not found.' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// PATCH /api/store/:id — update store settings
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOne({ _id: req.params.id, owner: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const allowed = [
      'name', 'tagline', 'description', 'slug',
      'logoUrl', 'primaryColor', 'accentColor', 'fontFamily', 'theme', 'colorScheme',
      'heroImage', 'heroHeadline', 'heroCta', 'announcement', 'gridColumns',
      'contact', 'currency', 'locale',
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
