const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash -resetToken -resetTokenExpiry').sort({ createdAt: -1 });
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
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
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
      .sort({ createdAt: -1 });
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
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: 'after' }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
