/**
 * Run with:  node scripts/seed.js
 * Does two things:
 *   1. Removes any admin user whose email ends in .pk
 *   2. Seeds dummy products into the first active store it finds
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User    = require('../src/models/User');
const Store   = require('../src/models/Store');
const Product = require('../src/models/Product');

const PRODUCTS = [
  // Electronics
  { title: 'Wireless Bluetooth Earbuds', description: 'High-fidelity sound with active noise cancellation. Up to 24 hours battery life with charging case.', price: 4500, stock: 30, category: 'Electronics', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'] },
  { title: 'Mechanical Keyboard', description: 'Compact TKL layout with Cherry MX Red switches. RGB backlighting and aluminium top plate.', price: 8900, stock: 15, category: 'Electronics', images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'] },
  { title: '4-Port USB-C Hub', description: 'Expand your laptop ports with 2× USB-A, 1× HDMI 4K, and 1× 100W PD pass-through.', price: 2200, stock: 50, category: 'Electronics', images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400'] },

  // Clothing
  { title: 'Classic White T-Shirt', description: '100% organic cotton. Pre-shrunk, relaxed fit. Available in sizes S–XXL.', price: 1200, stock: 100, category: 'Clothing', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'] },
  { title: 'Slim Fit Chinos', description: 'Stretch-cotton twill chinos in a modern slim fit. Perfect for smart-casual occasions.', price: 3400, stock: 40, category: 'Clothing', images: ['https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=400'] },
  { title: 'Floral Summer Dress', description: 'Lightweight viscose with a flattering A-line cut. Machine washable.', price: 2800, stock: 25, category: 'Clothing', images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'] },

  // Food & Beverages
  { title: 'Premium Kashmiri Green Tea', description: 'Hand-picked from high-altitude gardens. Earthy, smooth flavour with floral notes. 50g tin.', price: 950, stock: 80, category: 'Food & Beverages', images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'] },
  { title: 'Artisan Dark Roast Coffee', description: 'Single-origin Ethiopian beans, medium-dark roast. Tasting notes of dark chocolate and cherry. 250g.', price: 1600, stock: 60, category: 'Food & Beverages', images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'] },

  // Home & Living
  { title: 'Lavender Soy Candle', description: 'Hand-poured with 100% natural soy wax and pure lavender essential oil. 40-hour burn time.', price: 1100, stock: 45, category: 'Home & Living', images: ['https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400'] },
  { title: 'Ceramic Mug Set (4 pcs)', description: 'Minimalist matte-finish ceramic mugs in four earth tones. Microwave and dishwasher safe.', price: 2400, stock: 20, category: 'Home & Living', images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400'] },

  // Beauty
  { title: 'Vitamin C Brightening Serum', description: '15% L-ascorbic acid with ferulic acid. Brightens skin tone and reduces dark spots. 30ml.', price: 3200, stock: 35, category: 'Beauty', images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'] },
  { title: 'Rose Hip Face Oil', description: 'Cold-pressed Chilean rosehip seed oil. Rich in omega fatty acids. Brightens and hydrates. 30ml.', price: 1800, stock: 50, category: 'Beauty', images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'] },

  // Books
  { title: 'Atomic Habits', description: 'James Clear\'s international bestseller on building good habits and breaking bad ones.', price: 1500, stock: 30, category: 'Books', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'] },

  // Sports
  { title: 'Premium Yoga Mat (6mm)', description: 'Non-slip TPE foam with alignment lines. Includes carry strap. 183 × 61cm.', price: 3500, stock: 20, category: 'Sports', images: ['https://images.unsplash.com/photo-1601925228606-4de0471cb2c9?w=400'] },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // ── 1. Remove .pk admin ──────────────────────────────────────────────────
  const pkAdmins = await User.find({ email: /.+\.pk$/i, role: 'admin' });
  if (pkAdmins.length === 0) {
    console.log('No .pk admin found — nothing to remove.');
  } else {
    for (const u of pkAdmins) {
      await User.findByIdAndDelete(u._id);
      console.log(`Removed admin: ${u.email}`);
    }
  }

  // ── 2. Seed dummy products ───────────────────────────────────────────────
  const store = await Store.findOne({ isActive: true });
  if (!store) {
    console.log('\nNo active store found. Register as a shopowner first, then re-run this script.');
    await mongoose.disconnect();
    return;
  }

  console.log(`\nSeeding products into store: "${store.name}" (${store.slug})`);

  let created = 0;
  for (const p of PRODUCTS) {
    const exists = await Product.findOne({ store: store._id, title: p.title });
    if (exists) {
      console.log(`  skip  ${p.title}`);
      continue;
    }
    await Product.create({ ...p, store: store._id });
    console.log(`  added ${p.title}`);
    created++;
  }

  console.log(`\nDone — ${created} product(s) created, ${PRODUCTS.length - created} already existed.`);
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
