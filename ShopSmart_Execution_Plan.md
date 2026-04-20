# ShopSmart — Execution Plan & Implementation Guide

**Project:** Web Store Platform for Small Businesses  
**Team:** Seerat E Zahra (23i-0640) · Minahil Kashif (23i-0554)  
**Stack:** Next.js · Express · MongoDB · Node.js

---

## Table of Contents

1. [Tech Stack Decision](#1-tech-stack-decision)
2. [Project Structure](#2-project-structure)
3. [Phase 1 — Setup & Architecture](#3-phase-1--setup--architecture)
4. [Phase 2 — Auth, Security & Roles](#4-phase-2--auth-security--roles)
5. [Phase 3 — Backend APIs & Admin Panel](#5-phase-3--backend-apis--admin-panel)
6. [Phase 4 — Frontend (Next.js)](#6-phase-4--frontend-nextjs)
7. [Phase 5 — UI Polish & Creative Elements](#7-phase-5--ui-polish--creative-elements)
8. [Phase 6 — Testing & Git Hygiene](#8-phase-6--testing--git-hygiene)
9. [Phase 7 — Deployment & Presentation](#9-phase-7--deployment--presentation)
10. [Rubric Coverage Checklist](#10-rubric-coverage-checklist)

---

## 1. Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Frontend | **Next.js (React)** | File-based routing, SSR, built-in middleware for route protection, `Image` component for performance |
| Backend | **Express.js** | Clean middleware chains for role-based auth, easy to test with Jest + Supertest |
| Database | **MongoDB + Mongoose** | Flexible schema for product catalogs and nested order documents; free Atlas tier |
| Auth | **JWT + bcrypt** | Stateless sessions, secure hash comparison, easy cookie handling |
| Styling | **Tailwind CSS** | Utility-first, responsive breakpoints out of the box |
| Animations | **Framer Motion** | Polished page transitions and micro-interactions for rubric creativity marks |
| Deployment | **Vercel + Render + MongoDB Atlas** | All free tiers, zero-config for Next.js on Vercel |

**Why not Angular?** Overkill for a two-person project. Heavier learning curve, more boilerplate.  
**Why not plain React?** No SSR, manual routing, no built-in middleware — extra work for no rubric benefit.  
**Why separate Express instead of only Next.js API routes?** Rubric heavily rewards backend middleware (#12), role guards, and security architecture. A proper Express server keeps auth logic clean, testable, and separate.

---

## 2. Project Structure

```
shopsmart/
├── client/                         # Next.js frontend
│   ├── app/
│   │   ├── layout.jsx              # Root layout (includes Navbar + Footer)
│   │   ├── page.jsx                # Home page
│   │   ├── products/
│   │   │   ├── page.jsx            # Product listing
│   │   │   └── [id]/page.jsx       # Product detail
│   │   ├── cart/page.jsx
│   │   ├── checkout/page.jsx
│   │   ├── orders/[id]/page.jsx    # Order tracking
│   │   ├── auth/
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   └── reset-password/page.jsx
│   │   └── admin/
│   │       ├── layout.jsx          # Admin guard layout
│   │       ├── dashboard/page.jsx
│   │       ├── products/page.jsx
│   │       ├── orders/page.jsx
│   │       └── users/page.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CartItem.jsx
│   │   └── ui/                     # Reusable UI components
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── lib/
│   │   └── api.js                  # Axios instance with base URL
│   ├── middleware.js                # Next.js route protection
│   └── .env.local
│
├── server/                         # Express backend
│   ├── src/
│   │   ├── index.js                # Entry point
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── Order.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── order.routes.js
│   │   │   └── admin.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # verifyToken
│   │   │   └── role.middleware.js   # requireRole('admin')
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── order.controller.js
│   │   │   └── admin.controller.js
│   │   └── utils/
│   │       └── email.js            # Nodemailer helper
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── products.test.js
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 3. Phase 1 — Setup & Architecture

**Rubric coverage:** #23 (repo), #24 (commits), #25 (commit messages), #34 (README)

### 1.1 Initialize Repository

```bash
# Create GitHub repo, then:
git clone https://github.com/your-username/shopsmart.git
cd shopsmart
mkdir client server
git add .
git commit -m "chore: initialize monorepo structure"
```

**Commit convention to follow throughout the project:**
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `style:` — formatting, no logic change
- `refactor:` — code restructuring
- `test:` — adding tests
- `chore:` — tooling, config

> **Target 15–20 commits minimum** to safely clear the 10-commit rubric requirement.

### 1.2 Initialize Next.js Client

```bash
cd client
npx create-next-app@latest . --app --tailwind --eslint
npm install axios framer-motion react-hot-toast zustand
```

### 1.3 Initialize Express Server

```bash
cd server
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cookie-parser cors dotenv express-validator nodemailer crypto
npm install --save-dev jest supertest nodemon
```

Add to `server/package.json`:
```json
"scripts": {
  "dev": "nodemon src/index.js",
  "test": "jest --runInBand"
}
```

### 1.4 MongoDB Connection

```js
// server/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 1.5 Database Schema Design

**Users collection:**
```js
// server/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  passwordHash:  { type: String, required: true },
  role:          { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive:      { type: Boolean, default: true },
  resetToken:    String,
  resetTokenExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

**Products collection:**
```js
// server/src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  stock:       { type: Number, required: true, min: 0, default: 0 },
  category:    { type: String, required: true },
  images:      [{ type: String }],
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

**Orders collection:**
```js
// server/src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title:    String,
  price:    Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail:  String,
  items:       [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: String, city: String, country: String, zip: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
```

### 1.6 Express Entry Point

```js
// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes    = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes   = require('./routes/order.routes');
const adminRoutes   = require('./routes/admin.routes');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 1.7 Environment Variables

```bash
# server/.env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shopsmart
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another_secret
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
PORT=5000

# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 4. Phase 2 — Auth, Security & Roles

**Rubric coverage:** #2, #4, #5, #6, #7, #8, #9, #10, #12, #21, #22

### 2.1 Auth Middleware

```js
// server/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken };
```

```js
// server/src/middleware/role.middleware.js
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions.' });
  }
  next();
};

module.exports = { requireRole };
```

### 2.2 Auth Controller

```js
// server/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const { sendResetEmail } = require('../utils/email');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    // RUBRIC #4: Hash with bcrypt, never store plain-text
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Invalid credentials.' });

    // RUBRIC #6: Use bcrypt.compare, never string equality
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }  // RUBRIC #22: short-lived session
    );

    // RUBRIC #21: remember-me via longer refresh token
    const refreshExpiry = rememberMe ? '7d' : '1d';
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: refreshExpiry });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully.' });
};

// FORGOT PASSWORD — RUBRIC #7: token-based, time-limited
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${rawToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired.' });

    user.passwordHash = await bcrypt.hash(req.body.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
```

### 2.3 Auth Routes

```js
// server/src/routes/auth.routes.js
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/auth.controller');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.post('/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Must contain a number'),
    validate,
  ],
  authController.register
);

router.post('/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    validate,
  ],
  authController.login
);

router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
```

### 2.4 Admin Routes (Protected)

```js
// server/src/routes/admin.routes.js
const router = require('express').Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const adminController = require('../controllers/admin.controller');

// All admin routes require a valid token AND admin role — RUBRIC #9, #12
router.use(verifyToken, requireRole('admin'));

router.get('/users',              adminController.getAllUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.patch('/users/:id/role',   adminController.changeUserRole);
router.get('/analytics',          adminController.getAnalytics);

module.exports = router;
```

---

## 5. Phase 3 — Backend APIs & Admin Panel

**Rubric coverage:** #1, #3, #10, #13, #14

### 3.1 Product Controller

```js
// server/src/controllers/product.controller.js
const Product = require('../models/Product');

// Public — get all active products with optional search/filter
exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

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

// Public — get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin — create product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin — update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin — soft delete
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
```

### 3.2 Product Routes

```js
// server/src/routes/product.routes.js
const router = require('express').Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const productController = require('../controllers/product.controller');

const productValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('category').notEmpty().withMessage('Category is required'),
];

router.get('/',     productController.getProducts);
router.get('/:id',  productController.getProduct);
router.post('/',    verifyToken, requireRole('admin'), productValidation, productController.createProduct);
router.put('/:id',  verifyToken, requireRole('admin'), productController.updateProduct);
router.delete('/:id', verifyToken, requireRole('admin'), productController.deleteProduct);

module.exports = router;
```

### 3.3 Order Controller

```js
// server/src/controllers/order.controller.js
const Order   = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, guestEmail } = req.body;

    // Validate stock and calculate total atomically
    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive)
        return res.status(400).json({ message: `Product ${item.product} not found.` });
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for "${product.title}".` });

      resolvedItems.push({ product: product._id, title: product.title, price: product.price, quantity: item.quantity });
      totalAmount += product.price * item.quantity;

      // Decrement stock atomically
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } });
    }

    const order = await Order.create({
      customer: req.user?.id || null,
      guestEmail,
      items: resolvedItems,
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
```

### 3.4 Admin Controller

```js
// server/src/controllers/admin.controller.js
const User    = require('../models/User');
const Order   = require('../models/Order');
const Product = require('../models/Product');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash -resetToken').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// RUBRIC #10: activate/deactivate accounts
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

// RUBRIC #10: change user role
exports.changeUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ message: 'Role updated.', role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Analytics endpoint
exports.getAnalytics = async (req, res) => {
  try {
    const totalOrders   = await Order.countDocuments();
    const totalRevenue  = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const lowStock      = await Product.find({ stock: { $lt: 10 }, isActive: true }, 'title stock');
    const topProducts   = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.title', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStock,
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
```

### 3.5 Email Utility

```js
// server/src/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.sendResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"ShopSmart" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });
};
```

---

## 6. Phase 4 — Frontend (Next.js)

**Rubric coverage:** #1, #2, #11, #13, #15, #16, #17, #18, #19, #20, #21, #26

### 4.1 API Client

```js
// client/lib/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send cookies automatically
});

// Intercept 401 responses and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### 4.2 Auth Context

```jsx
// client/context/AuthContext.jsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, rememberMe) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 4.3 Next.js Middleware (Client-side Route Protection)

```js
// client/middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('accessToken');
  const { pathname } = req.nextUrl;

  // Protect admin routes — RUBRIC #9
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Redirect logged-in users away from auth pages
  if ((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/checkout', '/orders/:path*'],
};
```

### 4.4 Root Layout (Navbar + Footer on every page)

```jsx
// client/app/layout.jsx
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'ShopSmart',
  description: 'E-commerce platform for small businesses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster position="top-right" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4.5 Navbar (Role-aware, Responsive) — RUBRIC #11, #16, #18

```jsx
// client/components/Navbar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold text-indigo-600">ShopSmart</Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-indigo-600">Products</Link>
          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="text-indigo-600 font-medium">Admin Dashboard</Link>
          )}
          {user ? (
            <>
              <Link href="/orders" className="text-gray-600 hover:text-indigo-600">My Orders</Link>
              <button onClick={logout} className="text-gray-600 hover:text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600">Login</Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Register</Link>
            </>
          )}
          <Link href="/cart" className="relative text-gray-600">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            )}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 bg-white border-t">
          <Link href="/products">Products</Link>
          {user?.role === 'admin' && <Link href="/admin/dashboard">Admin Dashboard</Link>}
          {user ? (
            <>
              <Link href="/orders">My Orders</Link>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
          <Link href="/cart">Cart ({cartCount})</Link>
        </div>
      )}
    </nav>
  );
}
```

### 4.6 Register Form (Client-side Validation) — RUBRIC #13, #15

```jsx
// client/app/auth/register/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 8)    e.password = 'Minimum 8 characters';
    if (!/[A-Z]/.test(form.password)) e.password = 'Must include an uppercase letter';
    if (!/[0-9]/.test(form.password)) e.password = 'Must include a number';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Please log in.');
      router.push('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {['name', 'email', 'password', 'confirm'].map(field => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium mb-1 capitalize">{field === 'confirm' ? 'Confirm Password' : field}</label>
            <input
              type={field.includes('password') || field === 'confirm' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]}
              onChange={e => setForm({ ...form, [field]: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
            />
            {/* RUBRIC #15: inline error messages */}
            {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </div>
    </div>
  );
}
```

### 4.7 Footer (on all pages via root layout) — RUBRIC #26

```jsx
// client/components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">ShopSmart</h3>
          <p className="text-sm">Empowering small businesses with a ready-to-use e-commerce platform.</p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/products" className="hover:text-white">Products</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-3">Contact</h4>
          <p className="text-sm">support@shopsmart.pk</p>
          <p className="text-sm mt-2">Rawalpindi, Pakistan</p>
          <div className="flex gap-4 mt-3">
            <a href="#" className="hover:text-white text-sm">Instagram</a>
            <a href="#" className="hover:text-white text-sm">LinkedIn</a>
            <a href="#" className="hover:text-white text-sm">Twitter</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
        © {new Date().getFullYear()} ShopSmart. All rights reserved.
      </div>
    </footer>
  );
}
```

---

## 7. Phase 5 — UI Polish & Creative Elements

**Rubric coverage:** #19, #20, #27, #28, #29, #30, #31, #32, #33

### 5.1 Page Transition Animation

```jsx
// client/components/PageWrapper.jsx
'use client';
import { motion } from 'framer-motion';

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap every page with `<PageWrapper>` for consistent fade-in transitions.

### 5.2 Product Card with Hover Animation

```jsx
// client/components/ProductCard.jsx
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100"
    >
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 bg-gray-100">
          <Image src={product.images[0] || '/placeholder.png'} alt={product.title} fill className="object-cover" />
          {product.stock < 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">Low Stock</span>
          )}
          {product.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Out of Stock</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 truncate">{product.title}</h3>
          <p className="text-sm text-gray-500 mt-1 truncate">{product.category}</p>
          <p className="text-indigo-600 font-bold mt-2">PKR {product.price.toLocaleString()}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}
```

### 5.3 Loading Skeleton (Replaces spinners)

```jsx
// client/components/ProductSkeleton.jsx
export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-9 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
```

### 5.4 Performance — Next.js Image Optimization

Always use the Next.js `<Image>` component instead of `<img>` for automatic WebP conversion, lazy loading, and responsive sizing:

```jsx
import Image from 'next/image';

// Good
<Image src={url} alt={title} width={400} height={300} loading="lazy" />

// Bad
<img src={url} alt={title} />
```

---

## 8. Phase 6 — Testing & Git Hygiene

**Rubric coverage:** #24, #25

### 6.1 API Testing with Jest + Supertest

```js
// server/tests/auth.test.js
const request = require('supertest');
const app     = require('../src/index');

describe('Auth API', () => {

  it('POST /api/auth/register — should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'Password1',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  it('POST /api/auth/register — should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User', email: 'test@example.com', password: 'Password1',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login — should login and set cookies', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'Password1',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('role');
  });

  it('POST /api/auth/login — wrong password should return 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'WrongPass1',
    });
    expect(res.statusCode).toBe(401);
  });

});
```

```js
// server/tests/products.test.js
describe('Product API', () => {

  it('GET /api/products — should return product list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('POST /api/products — should reject unauthenticated requests', async () => {
    const res = await request(app).post('/api/products').send({
      title: 'Test', price: 100, stock: 10, category: 'Test',
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/products — should reject non-admin users', async () => {
    // Login as regular user first, then attempt product creation
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'test@example.com', password: 'Password1',
    });
    const token = loginRes.headers['set-cookie'];
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', token)
      .send({ title: 'Test', price: 100, stock: 10, category: 'Test', description: 'desc' });
    expect(res.statusCode).toBe(403);
  });

});
```

### 6.2 Checklist Before Final Submission

```
[ ] All navbar links resolve without 404
[ ] Admin routes return 403 when accessed as a regular user
[ ] Password reset link works and expires correctly
[ ] Cart updates persist across page navigation
[ ] Out-of-stock items cannot be purchased
[ ] Session expires and redirects to login
[ ] Mobile layout tested at 375px, 768px, 1280px
[ ] All form errors display inline (not as alerts)
[ ] Footer present on every page
[ ] README has live URL, setup instructions, and feature list
```

### 6.3 Commit History Target

```
feat: initialize Next.js and Express project structure
chore: configure MongoDB connection and environment variables
feat: add User, Product, Order mongoose models
feat: implement register and login API with bcrypt
feat: add JWT middleware and role-based route protection
feat: implement forgot password with token-based reset flow
feat: add product CRUD API with admin protection
feat: implement order creation with stock decrement
feat: add admin analytics and user management endpoints
feat: build Navbar with role-aware links
feat: build product listing page with search and filter
feat: implement cart context and cart page
feat: build checkout form with client-side validation
feat: add order tracking page with status stepper
feat: build admin dashboard with analytics cards
feat: add Framer Motion page transitions and card animations
feat: implement responsive mobile navigation
style: finalize color palette and typography
docs: complete README with setup and deployment instructions
chore: deploy to Vercel and Render
```

---

## 9. Phase 7 — Deployment & Presentation

**Rubric coverage:** #34, #35

### 7.1 MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user with read/write permissions
3. Whitelist IP `0.0.0.0/0` (allow all, for deployment)
4. Copy the connection string and paste it as `MONGO_URI` in your environment variables

### 7.2 Deploy Express to Render

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, set root directory to `server/`
4. Build command: `npm install` | Start command: `node src/index.js`
5. Add all environment variables from your `server/.env`

### 7.3 Deploy Next.js to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set root directory to `client/`
3. Add `NEXT_PUBLIC_API_URL` pointing to your Render backend URL
4. Deploy — Vercel detects Next.js automatically

### 7.4 Demo Walkthrough Script

Record a video covering two flows:

**Customer flow (5–7 min):**
- Browse home page and product listing
- Filter by category, search for a product
- View product detail
- Add items to cart, update quantities
- Checkout with shipping details
- View order tracking page with status

**Admin flow (5–7 min):**
- Login as admin (show redirect to admin dashboard)
- View analytics (total orders, revenue, top products, low stock)
- Add a new product, edit price, soft-delete a product
- Update an order status from pending to shipped
- View user list, deactivate a user account, change a user's role

---

## 10. Rubric Coverage Checklist

| # | Criterion | How It's Covered | Marks |
|---|---|---|---|
| 1 | All core features work | Full product/cart/checkout/order/admin flow | 10 |
| 2 | Login & signup end-to-end | JWT auth, bcrypt, httpOnly cookies | 10 |
| 3 | Data processing / CRUD / API | Product CRUD, order creation, inventory update | 5 |
| 4 | Passwords hashed (bcrypt) | `bcrypt.hash(password, 12)` in register | 8 |
| 5 | No plain-text passwords stored or logged | Hash-only storage, no logging | 5 |
| 6 | Secure hash comparison | `bcrypt.compare()`, never `===` | 4 |
| 7 | Token-based password reset | `crypto.randomBytes`, hashed token, 1-hour expiry | 3 |
| 8 | Two roles in database | `role: ['user', 'admin']` in User model | 5 |
| 9 | Admin dashboard protected | `requireRole('admin')` middleware + Next.js middleware | 8 |
| 10 | Admin manages users | Activate/deactivate, change roles endpoint | 7 |
| 11 | Dynamic nav by role | Navbar shows Admin link only for admin role | 5 |
| 12 | Backend role middleware | `verifyToken` + `requireRole` chained on all admin routes | 5 |
| 13 | Client-side validation | Register/checkout forms validate before submission | 5 |
| 14 | Server-side validation | `express-validator` on all POST routes | 5 |
| 15 | Inline error messages | Error text below each invalid field | 5 |
| 16 | Working navbar, no broken routes | Sticky navbar in root layout, all links tested | 5 |
| 17 | Logical page hierarchy | Home → Products → Detail → Cart → Checkout → Track | 3 |
| 18 | Responsive navbar | Hamburger menu on mobile, sticky positioning | 2 |
| 19 | Clean consistent layout | Tailwind design system, uniform spacing/colors | 5 |
| 20 | Responsive design | Tailwind breakpoints, tested at 3 sizes | 5 |
| 21 | Login/logout + remember-me | Cookie-based session, remember-me refresh token | 10 |
| 22 | Session expiry | 15-min access token, re-login required | 5 |
| 23 | GitHub repo with project structure | Monorepo on GitHub | 3 |
| 24 | 10+ meaningful commits | Target 20 commits with logical increments | 4 |
| 25 | Consistent commit messages | `feat:`, `fix:`, `docs:` convention | 3 |
| 26 | Footer on all pages | Footer in root layout, contact + social + copyright | 5 |
| 27 | Original content | Real product descriptions, custom copy | 5 |
| 28 | Images, icons, multimedia | Next.js optimized images, product photos | 5 |
| 29 | Unique/innovative concept | Small business e-commerce with analytics | 5 |
| 30 | Visual polish | Color palette, font pairing, whitespace | 5 |
| 31 | Animations & micro-interactions | Framer Motion, card hover, toast notifications | 5 |
| 32 | Creative impression | Theme consistency, delight in interactions | 5 |
| 33 | Performance & optimization | Next.js Image, code splitting, lazy loading | 5 |
| 34 | README / documentation | Complete README with setup + features | 3 |
| 35 | Live demo or walkthrough | Recorded video of both customer and admin flows | 2 |
| **Total** | | | **180** |

---

> **Highest-value sections:** Password Security (20 marks) + Role-Based Access (25 marks) + Auth/Session (15 marks) = **60 marks**. Prioritize Phase 2 before anything else. Do not sacrifice security features for UI polish.
