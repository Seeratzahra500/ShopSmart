const crypto    = require('crypto');
const mongoose  = require('mongoose');
const Order     = require('../models/Order');
const Product   = require('../models/Product');
const Store     = require('../models/Store');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/mailer');

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, guestEmail, storeSlug } = req.body;
  if (!storeSlug) return res.status(400).json({ message: 'storeSlug is required.' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: 'items must be a non-empty array.' });

  const session = await mongoose.startSession();
  try {
    let order;
    let orderStore;
    await session.withTransaction(async () => {
      const store = await Store.findOne({ slug: storeSlug, isActive: true }).session(session);
      if (!store) throw Object.assign(new Error('Store not found or inactive.'), { status: 400 });
      orderStore = store;

      let totalAmount = 0;
      const resolvedItems = [];

      for (const item of items) {
        if (!item.product || !(Number.isInteger(item.quantity) && item.quantity > 0))
          throw Object.assign(new Error('Each item needs a product and a positive integer quantity.'), { status: 400 });

        // Price and stock are always re-read from the DB below — the client-supplied
        // item never carries price, so a tampered request body can't under-charge an order.
        const product = await Product.findOneAndUpdate(
          { _id: item.product, store: store._id, isActive: true, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { returnDocument: 'after', session }
        );
        if (!product) {
          // Distinguish "doesn't exist" from "out of stock" for a useful error, still inside the transaction.
          const exists = await Product.findOne({ _id: item.product, store: store._id, isActive: true }).session(session);
          if (!exists) throw Object.assign(new Error(`Product ${item.product} not found in this store.`), { status: 400 });
          throw Object.assign(new Error(`Insufficient stock for "${exists.title}".`), { status: 400 });
        }

        resolvedItems.push({
          product:  product._id,
          title:    product.title,
          price:    product.price,
          quantity: item.quantity,
        });
        totalAmount += product.price * item.quantity;
      }

      const guestToken = req.user ? undefined : crypto.randomBytes(24).toString('hex');
      const created = await Order.create([{
        store:       store._id,
        customer:    req.user?.id || null,
        guestEmail,
        guestToken,
        items:       resolvedItems,
        totalAmount,
        shippingAddress,
      }], { session });
      order = created[0];
    });

    res.status(201).json(order);

    // Fire-and-forget order confirmation email — never let mail delivery
    // affect the response already sent above.
    (async () => {
      let recipientEmail = order.guestEmail;
      if (!recipientEmail && order.customer) {
        const populated = await Order.findById(order._id).populate('customer', 'email');
        recipientEmail = populated?.customer?.email;
      }
      return sendOrderConfirmation(order, orderStore, recipientEmail);
    })().catch((err) => console.error('[mailer]', err.message));
  } catch (err) {
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error.' });
  } finally {
    session.endSession();
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('+guestToken')
      .populate('items.product', 'title images');
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
    } else {
      // Unauthenticated: only the holder of the per-order guest token (from the
      // order-confirmation link/email) may view it — order IDs alone are not secret.
      const token = req.query.token;
      const valid = order.guestToken && typeof token === 'string' &&
        token.length === order.guestToken.length &&
        crypto.timingSafeEqual(Buffer.from(token), Buffer.from(order.guestToken));
      if (!valid) return res.status(403).json({ message: 'Forbidden.' });
    }

    const result = order.toObject();
    delete result.guestToken;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }).limit(1000);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const { status, page = 1 } = req.query;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const query = { store: store._id };
    if (status) query.status = status;

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const LEGAL_TRANSITIONS = {
  pending:    ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status))
    return res.status(400).json({ message: 'Invalid status.' });

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const filter = { _id: req.params.id };
      if (req.user.role !== 'admin') {
        const store = await Store.findOne({ owner: req.user.id }).session(session);
        if (!store) throw Object.assign(new Error('No store found for your account.'), { status: 403 });
        filter.store = store._id;
      }

      const order = await Order.findOne(filter).session(session);
      if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });

      if (status !== order.status) {
        const allowed = LEGAL_TRANSITIONS[order.status] || [];
        if (!allowed.includes(status))
          throw Object.assign(new Error(`Cannot transition order from "${order.status}" to "${status}".`), { status: 400 });
      }

      // Cancelling releases the reserved stock back to the store.
      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
        }
      }

      order.status = status;
      await order.save({ session });
      result = order;
    });

    res.json(result);

    // Fire-and-forget status-update email, only for the customer-facing
    // milestones (shipped/delivered) — never let mail delivery affect the
    // response already sent above.
    if (['shipped', 'delivered'].includes(result.status)) {
      (async () => {
        let recipientEmail = result.guestEmail;
        if (!recipientEmail && result.customer) {
          const populated = await Order.findById(result._id).populate('customer', 'email');
          recipientEmail = populated?.customer?.email;
        }
        const orderStore = await Store.findById(result.store);
        return sendOrderStatusUpdate(result, orderStore, recipientEmail);
      })().catch((err) => console.error('[mailer]', err.message));
    }
  } catch (err) {
    res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error.' });
  } finally {
    session.endSession();
  }
};
