const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');

// Admin list pages don't paginate their UI yet, so these keep returning a
// plain array (the shape the client already expects) but cap how many
// documents a single request can pull back, to bound response size/cost.
const HARD_CAP = 1000;

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash -resetToken -resetTokenExpiry')
      .sort({ createdAt: -1 })
      .limit(HARD_CAP);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    if (!user.isActive) user.tokenVersion += 1; // kill any active sessions on deactivation
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'shopowner', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user._id.toString() === req.user.id)
      return res.status(400).json({ message: 'Cannot change your own role.' });
    user.role = role;
    await user.save();
    res.json({ message: `Role changed to ${role}.`, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};


exports.getAnalytics = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalStores, revenueAgg, lowStock, topProducts] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Store.countDocuments({ isActive: true }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Product.find({ stock: { $lt: 10 }, isActive: true }, 'title stock'),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.title', totalSold: { $sum: '$items.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalStores,
      totalRevenue: revenueAgg[0]?.total || 0,
      lowStock,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(HARD_CAP);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.toggleStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found.' });
    store.isActive = !store.isActive;
    await store.save();
    res.json({ message: `Store ${store.isActive ? 'activated' : 'deactivated'}.`, isActive: store.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(HARD_CAP);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    await Product.deleteMany({ store: store._id });
    await Store.deleteOne({ _id: store._id });

    res.json({ message: 'Store and related products deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
