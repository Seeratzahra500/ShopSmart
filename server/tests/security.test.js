const request  = require('supertest');
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const app      = require('../src/index');
const User     = require('../src/models/User');
const Store    = require('../src/models/Store');
const Product  = require('../src/models/Product');
const Order    = require('../src/models/Order');

let ownerA, ownerB, storeA, storeB, productA, ownerACookie, ownerBCookie;

function accessTokenCookie(res) {
  const cookie = res.headers['set-cookie'].find(c => c.startsWith('accessToken='));
  return cookie.split(';')[0];
}

beforeAll(async () => {
  ownerA = await User.create({
    name: 'Owner A', email: 'owner_a_sec@shopsmart.test',
    passwordHash: await bcrypt.hash('Password1', 12), role: 'shopowner',
  });
  ownerB = await User.create({
    name: 'Owner B', email: 'owner_b_sec@shopsmart.test',
    passwordHash: await bcrypt.hash('Password1', 12), role: 'shopowner',
  });
  storeA = await Store.create({ owner: ownerA._id, name: 'Store A', slug: 'sec-test-store-a' });
  storeB = await Store.create({ owner: ownerB._id, name: 'Store B', slug: 'sec-test-store-b' });
  productA = await Product.create({
    store: storeA._id, title: 'Widget A', description: 'desc', price: 50, stock: 5, category: 'Books',
  });

  const resA = await request(app).post('/api/auth/login').send({ email: ownerA.email, password: 'Password1' });
  ownerACookie = accessTokenCookie(resA);
  const resB = await request(app).post('/api/auth/login').send({ email: ownerB.email, password: 'Password1' });
  ownerBCookie = accessTokenCookie(resB);
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /\.test$/ } });
  await Store.deleteMany({ slug: { $regex: /^sec-test-/ } });
  await Product.deleteMany({ store: { $in: [storeA._id, storeB._id] } });
  await Order.deleteMany({ store: { $in: [storeA._id, storeB._id] } });
  await mongoose.disconnect();
});

describe('IDOR — cross-owner product access', () => {
  it("rejects owner B updating owner A's product", async () => {
    const res = await request(app)
      .put(`/api/products/${productA._id}`)
      .set('Cookie', ownerBCookie)
      .send({ price: 1 });
    expect(res.statusCode).toBe(404);

    const unchanged = await Product.findById(productA._id);
    expect(unchanged.price).toBe(50);
  });
});

describe('Mass assignment protection', () => {
  it('ignores store/averageRating/reviewCount on create', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', ownerACookie)
      .send({
        title: 'Hacked Product', description: 'desc', price: 10, stock: 1, category: 'Books',
        store: storeB._id.toString(), averageRating: 5, reviewCount: 999,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.store).toBe(storeA._id.toString());
    expect(res.body.averageRating).toBe(0);
    expect(res.body.reviewCount).toBe(0);
    await Product.findByIdAndDelete(res.body._id);
  });
});

describe('Order creation — tamper and stock-race protection', () => {
  it('ignores a client-supplied price and uses the server price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        storeSlug: storeA.slug,
        items: [{ product: productA._id, quantity: 1, price: 1 }],
        guestEmail: 'buyer@shopsmart.test',
        shippingAddress: { street: '1 Main St', city: 'Lahore', country: 'PK', zip: '54000' },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.totalAmount).toBe(50);
    expect(res.body.items[0].price).toBe(50);
  });

  it('rejects an order that overshoots stock and leaves stock untouched', async () => {
    const before = await Product.findById(productA._id);
    const res = await request(app)
      .post('/api/orders')
      .send({
        storeSlug: storeA.slug,
        items: [{ product: productA._id, quantity: before.stock + 1000 }],
        guestEmail: 'buyer@shopsmart.test',
        shippingAddress: { street: '1 Main St', city: 'Lahore', country: 'PK', zip: '54000' },
      });
    expect(res.statusCode).toBe(400);
    const after = await Product.findById(productA._id);
    expect(after.stock).toBe(before.stock);
  });

  it('rejects an empty items array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ storeSlug: storeA.slug, items: [], guestEmail: 'buyer@shopsmart.test' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Guest order PII protection', () => {
  it('rejects viewing a guest order without the guest token', async () => {
    const createRes = await request(app)
      .post('/api/orders')
      .send({
        storeSlug: storeA.slug,
        items: [{ product: productA._id, quantity: 1 }],
        guestEmail: 'buyer@shopsmart.test',
        shippingAddress: { street: '1 Main St', city: 'Lahore', country: 'PK', zip: '54000' },
      });
    const orderId = createRes.body._id;

    const noToken = await request(app).get(`/api/orders/${orderId}`);
    expect(noToken.statusCode).toBe(403);

    const wrongToken = await request(app).get(`/api/orders/${orderId}?token=wrongtoken`);
    expect(wrongToken.statusCode).toBe(403);

    const rightToken = await request(app).get(`/api/orders/${orderId}?token=${createRes.body.guestToken}`);
    expect(rightToken.statusCode).toBe(200);
    expect(rightToken.body).not.toHaveProperty('guestToken');
  });
});

describe('Store slug validation', () => {
  it('rejects a reserved slug', async () => {
    const res = await request(app)
      .patch(`/api/store/${storeA._id}`)
      .set('Cookie', ownerACookie)
      .send({ slug: 'analytics' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects a malformed slug', async () => {
    const res = await request(app)
      .patch(`/api/store/${storeA._id}`)
      .set('Cookie', ownerACookie)
      .send({ slug: 'Not Valid Slug!' });
    expect(res.statusCode).toBe(400);
  });

  it('accepts a valid slug', async () => {
    const res = await request(app)
      .patch(`/api/store/${storeA._id}`)
      .set('Cookie', ownerACookie)
      .send({ slug: 'sec-test-store-a-renamed' });
    expect(res.statusCode).toBe(200);
    expect(res.body.slug).toBe('sec-test-store-a-renamed');
    storeA.slug = 'sec-test-store-a-renamed';
  });
});
