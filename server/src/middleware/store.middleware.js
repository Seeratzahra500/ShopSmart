const Store = require('../models/Store');

// Attaches the current user's own store as req.store, or 404s. Only fits routes
// where a missing store is unconditionally a 404 for this user (not the
// admin-vs-owner branching some order/product controllers still do inline,
// and not getMine, which auto-creates instead of 404ing).
async function loadOwnStore(req, res, next) {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found.' });
    req.store = store;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}

module.exports = { loadOwnStore };
