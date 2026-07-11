require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const { sanitizeBody } = require('./middleware/sanitize.middleware');

const authRoutes    = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes   = require('./routes/order.routes');
const adminRoutes   = require('./routes/admin.routes');
const storeRoutes   = require('./routes/store.routes');
const storesRoutes  = require('./routes/stores.routes');
const uploadRoutes  = require('./routes/upload.routes');

const app = express();
connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
  process.env.CLIENT_URL_PROD2,
].filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeBody);

// Skip throttling in the test env so the Jest suite (many sequential requests
// from one IP) isn't rate-limited against itself; fully active in dev/prod.
const isTest = process.env.NODE_ENV === 'test';
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false, skip: () => isTest });
const authLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, skip: () => isTest,
  message: { message: 'Too many attempts. Please try again later.' } });

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/store',    storeRoutes);
app.use('/api/stores',   storesRoutes);
app.use('/api/uploads',  uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler — catches CORS rejection and anything a route forgot to
// try/catch, and keeps stack traces out of the response body.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.expose ? err.message : 'Server error.' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
