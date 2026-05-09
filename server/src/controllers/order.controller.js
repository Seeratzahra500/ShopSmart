const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, guestEmail, storeSlug } = req.body;
    if (!storeSlug) return res.status(400).json({ message: 'storeSlug is required.' });

    const store = await Store.findOne({ slug: storeSlug, isActive: true });
    if (!store) return res.status(400).json({ message: 'Store not found or inactive.' });

    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findOne({ _id: item.product, store: store._id, isActive: true });
      if (!product)
        return res.status(400).json({ message: `Product ${item.product} not found in this store.` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for "${product.title}".` });

      resolvedItems.push({
        product:  product._id,
        title:    product.title,
        price:    product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;

      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      store:       store._id,
      customer:    req.user?.id || null,
      guestEmail,
      items:       resolvedItems,
      totalAmount,
      shippingAddress,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'title images');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (req.user) {
      if (req.user.role === 'admin') {
        // admin sees all
      } else if (req.user.role === 'shopowner') {
        const store = await Store.findOne({ owner: req.user.id });
        if (!store || !order.store.equals(store._id))
          return res.status(403).json({ message: 'Forbidden.' });
      } else {
        // customer: must own the order
        if (!order.customer || !order.customer.equals(req.user.id))
          return res.status(403).json({ message: 'Forbidden.' });
      }
    }
    // unauthenticated guests can track orders via direct link (order ID)

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const { status, page = 1, limit = 20 } = req.query;
    const query = { store: store._id };
    if (status) query.status = status;

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let order;

    if (req.user.role === 'admin') {
      order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    } else {
      const store = await Store.findOne({ owner: req.user.id });
      if (!store) return res.status(403).json({ message: 'No store found for your account.' });
      order = await Order.findOneAndUpdate(
        { _id: req.params.id, store: store._id },
        { status },
        { returnDocument: 'after' }
      );
    }

    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
