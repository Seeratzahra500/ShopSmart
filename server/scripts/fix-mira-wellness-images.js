require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Store = require('../src/models/Store');
const Product = require('../src/models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsmart');
  const store = await Store.findOne({ slug: 'mira-wellness' });
  if (!store) {
    console.error('Mira Wellness store not found');
    process.exit(1);
  }

  const updates = [
    {
      title: 'Vitamin C Serum',
      images: ['https://images.unsplash.com/photo-1587614382346-ac4a0f6c1c06?auto=format&fit=crop&w=800&q=80'],
    },
    {
      title: 'Rosehip Face Oil',
      images: ['https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80'],
    },
    {
      title: 'Lavender Body Balm',
      images: ['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80'],
    },
  ];

  for (const update of updates) {
    const product = await Product.findOne({ store: store._id, title: update.title });
    if (!product) {
      console.warn(`Product not found: ${update.title}`);
      continue;
    }
    product.images = update.images;
    await product.save();
    console.log(`Updated ${update.title}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
