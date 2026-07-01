require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Store = require('../src/models/Store');
const Product = require('../src/models/Product');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsmart');
  console.log('Stores:');
  const stores = await Store.find({}, 'name slug logoUrl heroImage').lean();
  stores.forEach((s) => console.log(JSON.stringify(s, null, 2)));
  console.log('Mira Wellness products:');
  const store = await Store.findOne({ slug: 'mira-wellness' });
  if (!store) { console.log('No mira-wellness store found'); await mongoose.disconnect(); return; }
  const products = await Product.find({ store: store._id }, 'title images').lean();
  products.forEach((p) => console.log(JSON.stringify(p, null, 2)));
  await mongoose.disconnect();
})();
