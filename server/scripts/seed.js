/**
 * Run with: node scripts/seed.js
 * Seeds realistic storefronts, shopowners, and products with external image URLs.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Store = require('../src/models/Store');
const Product = require('../src/models/Product');

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const STORE_SEEDS = [
  {
    ownerName: 'Amina Hassan',
    ownerEmail: 'amina@northstarstudio.com',
    store: {
      name: 'Northstar Studio',
      tagline: 'Modern essentials for calm, curated living',
      description: 'A design-led home and lifestyle shop featuring sculptural decor, handcrafted objects, and warm minimal pieces.',
      slug: 'northstar-studio',
      logoUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#111827',
      accentColor: '#f59e0b',
      theme: 'minimal',
      fontFamily: 'Montserrat',
      contact: {
        email: 'hello@northstarstudio.com',
        phone: '+92 300 1234567',
        address: 'Block 6, Gulberg III, Lahore',
        instagram: '@northstarstudio',
      },
    },
    products: [
      {
        title: 'Sculptural Oak Lamp',
        description: 'A warm, matte-finish lamp made for reading nooks and elegant side tables.',
        price: 18500,
        stock: 12,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Textured Linen Throw',
        description: 'Soft, breathable linen with a relaxed weave and muted earthy tones.',
        price: 6200,
        stock: 18,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Stoneware Dinner Set',
        description: 'Hand-finished ceramic plates and bowls in a warm, natural glaze.',
        price: 12900,
        stock: 9,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    ownerName: 'Bilal Khan',
    ownerEmail: 'bilal@loomandthread.com',
    store: {
      name: 'Loom & Thread',
      tagline: 'Tailored staples for everyday confidence',
      description: 'A contemporary clothing label creating polished essentials from breathable cotton and refined textures.',
      slug: 'loom-thread',
      logoUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#1f2937',
      accentColor: '#ec4899',
      theme: 'bold',
      fontFamily: 'Poppins',
      contact: {
        email: 'hello@loomandthread.com',
        phone: '+92 333 4455666',
        address: 'DHA Phase 2, Karachi',
        instagram: '@loomandthread',
      },
    },
    products: [
      {
        title: 'Relaxed Cotton Shirt',
        description: 'A lightly structured shirt in a refined, soft cotton that wears effortlessly.',
        price: 4200,
        stock: 24,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Tailored Wool Blazer',
        description: 'Sharp shoulders and a clean drape designed for workdays and evenings out.',
        price: 11800,
        stock: 10,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Weekend Knit Set',
        description: 'An easy knit pairing crafted for travel, brunch, and layered comfort.',
        price: 7600,
        stock: 15,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    ownerName: 'Sara Mir',
    ownerEmail: 'sara@saffronstreet.pk',
    store: {
      name: 'Saffron Street',
      tagline: 'Small-batch pantry staples and timeless treats',
      description: 'A pantry boutique curating premium tea, roasted coffee, and handcrafted confections from regional makers.',
      slug: 'saffron-street',
      logoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#7c2d12',
      accentColor: '#f59e0b',
      theme: 'elegant',
      fontFamily: 'Playfair Display',
      contact: {
        email: 'hello@saffronstreet.pk',
        phone: '+92 321 1122334',
        address: 'B-17, Liberty Market, Lahore',
        instagram: '@saffronstreetpk',
      },
    },
    products: [
      {
        title: 'Kashmiri Green Tea Tin',
        description: 'A fragrant, hand-picked green tea with soft floral notes and bright finish.',
        price: 1450,
        stock: 40,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Single-Origin Espresso Beans',
        description: 'Rich dark-roast beans balanced with caramel, cocoa, and toasted spice.',
        price: 2100,
        stock: 30,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Honey Pistachio Shortbread',
        description: 'Buttery shortbread with pistachio crunch and a hint of honey glaze.',
        price: 1100,
        stock: 22,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
  {
    ownerName: 'Hammad Rauf',
    ownerEmail: 'hammad@aeroandoak.com',
    store: {
      name: 'Aero & Oak',
      tagline: 'Thoughtful technology for modern work',
      description: 'A sleek accessories store for laptop, desk, and travel essentials with a refined industrial aesthetic.',
      slug: 'aero-oak',
      logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#0f172a',
      accentColor: '#38bdf8',
      theme: 'minimal',
      fontFamily: 'Inter',
      contact: {
        email: 'hello@aeroandoak.com',
        phone: '+92 312 9988776',
        address: 'Main Boulevard, Gulberg, Islamabad',
        instagram: '@aeroandoak',
      },
    },
    products: [
      {
        title: 'USB-C Hub with 4K HDMI',
        description: 'Expand your workspace with high-speed ports for charging, display, and data.',
        price: 6900,
        stock: 28,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Wireless Noise-Cancelling Earbuds',
        description: 'Compact earbuds with rich sound and all-day comfort for commutes and calls.',
        price: 11500,
        stock: 20,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Mechanical Keyboard Pro',
        description: 'A tactile keyboard with adjustable backlight and a durable aluminum frame.',
        price: 14900,
        stock: 14,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopsmart');
  console.log('Connected to MongoDB\n');

  let createdStores = 0;
  let createdProducts = 0;

  for (const seed of STORE_SEEDS) {
    let owner = await User.findOne({ email: seed.ownerEmail });
    if (!owner) {
      owner = await User.create({
        name: seed.ownerName,
        email: seed.ownerEmail,
        passwordHash: 'seeded-password-hash',
        role: 'shopowner',
        isActive: true,
      });
      console.log(`Created shopowner: ${owner.email}`);
    }

    const storePayload = {
      owner: owner._id,
      ...seed.store,
      slug: seed.store.slug || slugify(seed.store.name),
      heroHeadline: seed.store.tagline,
      announcement: {
        text: 'Fresh arrivals are now live.',
        color: '#4f46e5',
        isActive: true,
      },
    };

    let store = await Store.findOne({ slug: storePayload.slug });
    if (!store) {
      store = await Store.create(storePayload);
      createdStores += 1;
      console.log(`Created store: ${store.name}`);
    } else {
      Object.assign(store, storePayload);
      await store.save();
      console.log(`Updated store: ${store.name}`);
    }

    for (const productSeed of seed.products) {
      const existingProduct = await Product.findOne({ store: store._id, title: productSeed.title });
      if (!existingProduct) {
        await Product.create({ ...productSeed, store: store._id });
        createdProducts += 1;
        console.log(`  + ${productSeed.title}`);
      } else {
        console.log(`  • ${productSeed.title} already exists`);
      }
    }
  }

  console.log(`\nSeed complete — ${createdStores} store(s) created, ${createdProducts} product(s) added.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
