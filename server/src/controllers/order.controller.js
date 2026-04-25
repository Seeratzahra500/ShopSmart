const Order   = require('../models/Order');
const Product = require('../models/Product');
const Store   = require('../models/Store');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, guestEmail } = req.body;
    const store = await Store.findOne({ isActive: true });
    if (!store) return res.status(400).json({ message: 'Store is not active.' });

    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ message: `Product ${item.product} not found.` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for "${product.title}".` });

      resolvedItems.push({
        product: product._id,
        title:   product.title,
        price:   product.price,
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
