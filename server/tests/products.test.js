const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

let adminToken;
let userToken;
let productId;

// Create admin + user accounts and get tokens before all tests
beforeAll(async () => {
  const User    = require('../src/models/User');
  const Store   = require('../src/models/Store');
  const bcrypt  = require('bcryptjs');

  // Upsert test admin
  const adminEmail = 'admin_prod_test@shopsmart.test';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Test Admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash('Admin1234', 12),
      role: 'admin',
    });
  } else {
    await User.findByIdAndUpdate(admin._id, { role: 'admin' });
  }

  // Ensure admin has a store
  let store = await Store.findOne({ owner: admin._id });
  if (!store) {
    store = await Store.create({
      owner: admin._id,
      name:  'Test Store',
      slug:  `test-${admin._id.toString().slice(-6)}`,
    });
  }

  // Upsert regular user
  const userEmail = 'user_prod_test@shopsmart.test';
  let user = await User.findOne({ email: userEmail });
  if (!user) {
    user = await User.create({
      name: 'Test User',
      email: userEmail,
      passwordHash: await bcrypt.hash('Password1', 12),
    });
  }

  // Login admin
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'Admin1234' });
  const adminCookie = adminRes.headers['set-cookie'].find(c => c.startsWith('accessToken='));
  adminToken = adminCookie.split(';')[0].replace('accessToken=', '');

  // Login user
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: userEmail, password: 'Password1' });
  const userCookie = userRes.headers['set-cookie'].find(c => c.startsWith('accessToken='));
  userToken = userCookie.split(';')[0].replace('accessToken=', '');
});

afterAll(async () => {
  const User    = require('../src/models/User');
  const Product = require('../src/models/Product');
  const Store   = require('../src/models/Store');
  await User.deleteMany({ email: { $regex: /\.test$/ } });
  if (productId) await Product.findByIdAndDelete(productId);
  await Store.deleteMany({ slug: { $regex: /^test-/ } });
  await mongoose.disconnect();
});

describe('GET /api/products', () => {
  it('returns paginated product list (public)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pages');
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/products?category=Electronics');
    expect(res.statusCode).toBe(200);
    res.body.products.forEach(p => expect(p.category).toBe('Electronics'));
  });

  it('filters by search term (case-insensitive)', async () => {
    const res = await request(app).get('/api/products?search=headphone');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('respects limit parameter', async () => {
    const res = await request(app).get('/api/products?limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.products.length).toBeLessThanOrEqual(2);
  });
});

describe('POST /api/products (admin only)', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ title: 'T', description: 'D', price: 100, stock: 1, category: 'Books' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects regular users with 403', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', `accessToken=${userToken}`)
      .send({ title: 'T', description: 'D', price: 100, stock: 1, category: 'Books' });
    expect(res.statusCode).toBe(403);
  });

  it('creates a product as admin with 201', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', `accessToken=${adminToken}`)
      .send({
        title:       'Test Headphones',
        description: 'Test product for Jest',
        price:       999,
        stock:       10,
        category:    'Electronics',
        images:      ['https://example.com/img.jpg'],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Headphones');
    expect(res.body).toHaveProperty('store');
    productId = res.body._id;
  });
});

describe('GET /api/products/:id', () => {
  it('returns a single product by ID', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(productId);
  });

  it('returns 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/products/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /api/products/:id (admin only)', () => {
  it('rejects non-admin with 403', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', `accessToken=${userToken}`)
      .send({ price: 1 });
    expect(res.statusCode).toBe(403);
  });

  it('updates a product as admin', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Cookie', `accessToken=${adminToken}`)
      .send({ price: 1299, stock: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(1299);
    expect(res.body.stock).toBe(5);
  });
});

describe('DELETE /api/products/:id (admin only, soft delete)', () => {
  it('soft-deletes a product (isActive → false)', async () => {
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Cookie', `accessToken=${adminToken}`);
    expect(res.statusCode).toBe(200);

    // Product should no longer appear in public listing
    const listRes = await request(app).get(`/api/products/${productId}`);
    expect(listRes.statusCode).toBe(404);
  });
});
