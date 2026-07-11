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
  // ---------------------------------------------------------------------
  // 1. minimal — home & living — editorial / gallery / airy
  // ---------------------------------------------------------------------
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
      primaryColor: '#5C4E4E',
      accentColor: '#988686',
      theme: 'minimal',
      fontFamily: 'Montserrat',
      design: { heroLayout: 'editorial', cardStyle: 'gallery', buttonShape: 'pill', density: 'airy', background: 'clean', showTrustStrip: true },
      contact: {
        email: 'hello@northstarstudio.com',
        phone: '+92 300 1234567',
        address: 'Block 6, Gulberg III, Lahore',
        instagram: 'https://instagram.com/northstarstudio',
      },
      announcementText: 'Fresh arrivals are now live.',
    },
    products: [
      {
        title: 'Sculptural Oak Lamp',
        description: 'A warm, matte-finish lamp made for reading nooks and elegant side tables.',
        price: 18500,
        stock: 12,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
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
      {
        title: 'Ceramic Pour-Over Set',
        description: 'A hand-glazed ceramic dripper and carafe for slow, aromatic mornings.',
        price: 8400,
        stock: 4,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Woven Seagrass Basket',
        description: 'A hand-woven storage basket that adds natural texture to any room.',
        price: 4100,
        stock: 21,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Hand-Poured Soy Candle',
        description: 'A slow-burning soy candle in a warm sandalwood and amber scent.',
        price: 1950,
        stock: 30,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Walnut Desk Organizer',
        description: 'A minimalist walnut tray for keeping stationery and small essentials in order.',
        price: 3200,
        stock: 0,
        category: 'Home & Living',
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 2. bold — streetwear label (clothing) — banner / framed / compact
  // ---------------------------------------------------------------------
  {
    ownerName: 'Bilal Khan',
    ownerEmail: 'bilal@loomandthread.com',
    store: {
      name: 'Loom & Thread',
      tagline: 'Loud streetwear for the concrete generation',
      description: 'An independent Karachi streetwear label dropping oversized fits, bold graphics, and limited-run capsule pieces.',
      slug: 'loom-thread',
      logoUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#facc15',
      accentColor: '#fbbf24',
      theme: 'bold',
      fontFamily: 'Poppins',
      design: { heroLayout: 'banner', cardStyle: 'framed', buttonShape: 'sharp', density: 'compact', background: 'clean', showTrustStrip: true },
      contact: {
        email: 'hello@loomandthread.com',
        phone: '+92 333 4455666',
        address: 'DHA Phase 2, Karachi',
        instagram: 'https://instagram.com/loomandthread',
      },
      announcementText: 'New drop just landed — while stock lasts.',
    },
    products: [
      {
        title: 'Oversized Graphic Hoodie',
        description: 'A heavyweight fleece hoodie with a bold front print and dropped shoulders.',
        price: 6500,
        stock: 24,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Cargo Utility Pants',
        description: 'Relaxed-fit cargo pants in ripstop cotton with multiple utility pockets.',
        price: 5200,
        stock: 16,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Boxy Logo Tee',
        description: 'A boxy-fit tee in heavyweight cotton with a puff-print chest logo.',
        price: 2400,
        stock: 35,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Varsity Bomber Jacket',
        description: 'A statement bomber jacket with contrast ribbing and embroidered patches.',
        price: 11800,
        stock: 4,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Track Jacket Zip-Up',
        description: 'A retro-inspired zip track jacket with taped side seams.',
        price: 5800,
        stock: 12,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Wide-Leg Denim Jeans',
        description: 'Stonewashed wide-leg denim built for an easy, oversized silhouette.',
        price: 6200,
        stock: 3,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Snapback Cap',
        description: 'A structured six-panel snapback with an embroidered front logo.',
        price: 1800,
        stock: 40,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 3. elegant — artisanal food / patisserie — split / gallery / airy
  // ---------------------------------------------------------------------
  {
    ownerName: 'Sara Mir',
    ownerEmail: 'sara@saffronstreet.pk',
    store: {
      name: 'Saffron Street',
      tagline: 'Small-batch pantry staples and timeless treats',
      description: 'A pantry boutique curating premium tea, roasted coffee, and handcrafted confections from regional makers.',
      slug: 'saffron-street',
      logoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#b8860b',
      accentColor: '#d4a843',
      theme: 'elegant',
      fontFamily: 'Playfair Display',
      design: { heroLayout: 'split', cardStyle: 'gallery', buttonShape: 'rounded', density: 'airy', background: 'tinted', showTrustStrip: false },
      contact: {
        email: 'hello@saffronstreet.pk',
        phone: '+92 321 1122334',
        address: 'B-17, Liberty Market, Lahore',
        instagram: 'https://instagram.com/saffronstreetpk',
      },
      announcementText: 'Eid gift boxes now available for pre-order.',
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
        images: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Honey Pistachio Shortbread',
        description: 'Buttery shortbread with pistachio crunch and a hint of honey glaze.',
        price: 1100,
        stock: 22,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Saffron Rose Macarons',
        description: 'Delicate almond macarons infused with saffron and rosewater, boxed in six.',
        price: 1850,
        stock: 15,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Oat-Milk Sourdough Loaf',
        description: 'A naturally leavened sourdough baked fresh with a crisp golden crust.',
        price: 850,
        stock: 4,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Dark Chocolate Truffle Box',
        description: 'Twelve handmade truffles rolled in cocoa, pistachio, and sea salt.',
        price: 2600,
        stock: 18,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Spiced Chai Blend Tin',
        description: 'A robust masala chai blend with cardamom, cinnamon, and clove.',
        price: 1250,
        stock: 26,
        category: 'Food & Beverages',
        images: ['https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 4. playful — NEW — kids' toys / stationery — fullbleed / tilted / regular
  // ---------------------------------------------------------------------
  {
    ownerName: 'Zoya Farooq',
    ownerEmail: 'zoya@tinkertown.pk',
    store: {
      name: 'Tinker Town',
      tagline: 'Playful toys and art supplies for curious kids',
      description: 'A bright, joyful shop stocking imaginative toys, art supplies, and stationery that turn playtime into a small adventure.',
      slug: 'tinker-town',
      logoUrl: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#EC4899',
      accentColor: '#A855F7',
      theme: 'playful',
      fontFamily: 'Nunito',
      design: { heroLayout: 'fullbleed', cardStyle: 'tilted', buttonShape: 'pill', density: 'regular', background: 'clean', showTrustStrip: true },
      contact: {
        email: 'hello@tinkertown.pk',
        phone: '+92 345 6677889',
        address: 'F-7 Markaz, Islamabad',
        instagram: 'https://instagram.com/tinkertownpk',
      },
      announcementText: 'Back-to-school bundles are here.',
    },
    products: [
      {
        title: 'Wooden Rainbow Stacker',
        description: 'A hand-painted wooden stacking toy that builds fine motor skills through play.',
        price: 2400,
        stock: 20,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1584697964358-3e14ca57658b?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: '48-Color Watercolor Set',
        description: 'A vibrant 48-pan watercolor palette with a built-in brush for young artists.',
        price: 1600,
        stock: 25,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Plush Elephant Toy',
        description: 'An ultra-soft plush elephant sized perfectly for hugs and naptime.',
        price: 1950,
        stock: 14,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1562007908-17c67e878c88?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: '100-Piece Jigsaw Puzzle',
        description: 'A colorful animal-kingdom puzzle designed to sharpen problem-solving skills.',
        price: 1200,
        stock: 3,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Building Blocks Mega Set',
        description: 'A 200-piece interlocking block set that encourages open-ended building play.',
        price: 3400,
        stock: 11,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Scented Gel Pen Set',
        description: 'A pack of 12 scented gel pens in bright, playful colors for journaling and school.',
        price: 950,
        stock: 30,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Kids Sketchbook & Crayon Kit',
        description: 'A spiral-bound sketchbook bundled with 24 chunky, easy-grip crayons.',
        price: 850,
        stock: 0,
        category: 'Toys',
        images: ['https://images.unsplash.com/photo-1568205612837-017257d2310a?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 5. brutalist — NEW — tech accessories / electronics — editorial/framed/compact
  // ---------------------------------------------------------------------
  {
    ownerName: 'Daniyal Sheikh',
    ownerEmail: 'daniyal@blockgadgets.pk',
    store: {
      name: 'Block Gadgets',
      tagline: 'No-nonsense tech built to survive your day',
      description: 'A stripped-down electronics shop selling durable chargers, cables, and desk gear with zero marketing fluff.',
      slug: 'block-gadgets',
      logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#EF4444',
      accentColor: '#111111',
      theme: 'brutalist',
      fontFamily: 'Space Grotesk',
      design: { heroLayout: 'editorial', cardStyle: 'framed', buttonShape: 'sharp', density: 'compact', background: 'clean', showTrustStrip: true },
      contact: {
        email: 'hello@blockgadgets.pk',
        phone: '+92 312 9988776',
        address: 'Main Boulevard, Gulberg, Islamabad',
        instagram: 'https://instagram.com/blockgadgets',
      },
      announcementText: 'Free shipping on orders over PKR 5,000.',
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
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Mechanical Keyboard Pro',
        description: 'A tactile keyboard with adjustable backlight and a durable aluminum frame.',
        price: 14900,
        stock: 14,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: '20000mAh Power Bank',
        description: 'A rugged, high-capacity power bank with dual fast-charge output ports.',
        price: 5400,
        stock: 4,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Braided USB-C Cable 2m',
        description: 'A reinforced braided cable built to survive daily desk-to-bag abuse.',
        price: 1200,
        stock: 50,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Adjustable Laptop Stand',
        description: 'An aluminum stand that raises your laptop to eye level for better posture.',
        price: 3800,
        stock: 3,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Wireless Charging Pad',
        description: 'A fast 15W wireless charging pad with a non-slip, minimal footprint base.',
        price: 2600,
        stock: 22,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&w=800&q=80'],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 6. midnight — audio gear / night-brand — fullbleed / gallery / regular
  // ---------------------------------------------------------------------
  {
    ownerName: 'Hammad Rauf',
    ownerEmail: 'hammad@aeroandoak.com',
    store: {
      name: 'Aero & Oak',
      tagline: 'Premium audio gear for late-night listening',
      description: 'A curated audio boutique specializing in headphones, turntables, and speakers built for immersive sound after dark.',
      slug: 'aero-oak',
      logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      heroImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80',
      primaryColor: '#22d3ee',
      accentColor: '#2dd4bf',
      theme: 'midnight',
      fontFamily: 'Inter',
      design: { heroLayout: 'fullbleed', cardStyle: 'gallery', buttonShape: 'rounded', density: 'regular', background: 'clean', showTrustStrip: true },
      contact: {
        email: 'hello@aeroandoak.com',
        phone: '+92 312 9988776',
        address: 'Main Boulevard, Gulberg, Islamabad',
        instagram: 'https://instagram.com/aeroandoak',
      },
      announcementText: 'Midnight sale — 15% off all headphones.',
    },
    products: [
      {
        title: 'Wireless Noise-Cancelling Headphones',
        description: 'Over-ear headphones with deep bass, plush cushions, and 30-hour battery life.',
        price: 24500,
        stock: 16,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Vintage-Style Turntable',
        description: 'A belt-driven turntable with built-in speakers and Bluetooth streaming.',
        price: 32000,
        stock: 6,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Portable Bluetooth Speaker',
        description: 'A rugged, water-resistant speaker with room-filling 360-degree sound.',
        price: 9800,
        stock: 20,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Studio Monitor Headphones',
        description: 'Flat-response monitoring headphones built for producers and audiophiles.',
        price: 18900,
        stock: 4,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Analog Vinyl Record Set',
        description: 'A curated three-record vinyl set spanning jazz, soul, and late-night lo-fi.',
        price: 6200,
        stock: 12,
        category: 'Books',
        images: ['https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'Desktop Audio Amplifier',
        description: 'A compact headphone amplifier with warm analog-style sound shaping.',
        price: 15400,
        stock: 3,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=800&q=80'],
      },
      {
        title: 'In-Ear Monitor Earphones',
        description: 'Precision-tuned in-ear monitors with a detachable braided cable.',
        price: 8600,
        stock: 0,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
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

    const { announcementText, ...storeFields } = seed.store;

    const storePayload = {
      owner: owner._id,
      ...storeFields,
      slug: seed.store.slug || slugify(seed.store.name),
      heroHeadline: seed.store.tagline,
      announcement: {
        text: announcementText || 'Fresh arrivals are now live.',
        color: seed.store.primaryColor,
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

module.exports.STORE_SEEDS = STORE_SEEDS;

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
