require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Store = require('../src/models/Store');
const Product = require('../src/models/Product');

const STORE_NAMES = ['awikwok', 'my shop', 'This Store', 'Mira Wellness'];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsmart');
  console.log('Connected to MongoDB');

  for (const name of STORE_NAMES) {
    const store = await Store.findOne({ name });
    if (!store) {
      console.log(`Store not found: ${name}`);
      continue;
    }

    const products = await Product.find({ store: store._id }, 'title');
    if (products.length > 0) {
      await Product.deleteMany({ store: store._id });
      console.log(`Deleted ${products.length} product(s) for store: ${name}`);
    }

    await Store.deleteOne({ _id: store._id });
    console.log(`Deleted store: ${name} (slug: ${store.slug})`);
  }

  await mongoose.disconnect();
  console.log('Cleanup finished.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
