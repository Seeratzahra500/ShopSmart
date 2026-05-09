const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  await seedAdmin();
};

async function seedAdmin() {
  try {
    const User = require('../models/User');

    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@shopsmart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';

    const existing = await User.findOne({ email: adminEmail, role: 'admin' });
    if (existing) return;

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await User.findOneAndUpdate(
      { email: adminEmail },
      { $setOnInsert: { name: 'Admin', email: adminEmail, passwordHash, role: 'admin', isActive: true } },
      { upsert: true }
    );

    console.log('─────────────────────────────────────────');
    console.log('  Default admin account created');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('  Override via ADMIN_EMAIL / ADMIN_PASSWORD in .env');
    console.log('─────────────────────────────────────────');
  } catch (err) {
    console.warn('Admin seed skipped:', err.message);
  }
}

module.exports = connectDB;
