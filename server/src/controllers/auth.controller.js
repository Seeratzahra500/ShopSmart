const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const Store  = require('../models/Store');
const { sendResetEmail } = require('../utils/email');

async function generateUniqueSlug(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let slug = base;
  let i = 1;
  while (await Store.findOne({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userRole = role === 'shopowner' ? 'shopowner' : 'customer';

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: userRole });

    if (userRole === 'shopowner') {
      const slug = await generateUniqueSlug(name);
      await Store.create({ owner: user._id, name, slug });
    }

    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isActive)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshExpiry = rememberMe ? '7d' : '1d';
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: refreshExpiry }
    );

    const secure   = process.env.NODE_ENV === 'production' || process.env.SECURE_COOKIES === 'true';
    const cookieBase = { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax' };
    res.cookie('accessToken', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, {
      ...cookieBase,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.logout = (req, res) => {
  const secure = process.env.NODE_ENV === 'production' || process.env.SECURE_COOKIES === 'true';
  const cookieBase = { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax' };
  res.clearCookie('accessToken', cookieBase);
  res.clearCookie('refreshToken', cookieBase);
  res.json({ message: 'Logged out successfully.' });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, '-passwordHash -resetToken -resetTokenExpiry');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${rawToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

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
