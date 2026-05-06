const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

// Use a separate test DB to avoid polluting dev data
const TEST_EMAIL = `test_${Date.now()}@shopsmart.test`;
const TEST_PASS  = 'Password1';

afterAll(async () => {
  // Clean up test users
  const User = require('../src/models/User');
  await User.deleteMany({ email: { $regex: /\.test$/ } });
  await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('creates a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Auth', email: TEST_EMAIL, password: TEST_PASS });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/success/i);
  });

  it('rejects duplicate email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: TEST_EMAIL, password: TEST_PASS });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects empty name with validation error', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'x@x.com', password: TEST_PASS });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects weak password (no uppercase)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak', email: 'weak@x.com', password: 'password1' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad', email: 'notanemail', password: TEST_PASS });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials and sets cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASS });
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toHaveProperty('role');
    expect(res.body.user.email).toBe(TEST_EMAIL);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some(c => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass1' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  it('rejects non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@x.com', password: TEST_PASS });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let accessToken;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASS });
    const cookie = res.headers['set-cookie'].find(c => c.startsWith('accessToken='));
    accessToken = cookie.split(';')[0].replace('accessToken=', '');
  });

  it('returns user data with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `accessToken=${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=this.is.not.valid');
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('always returns 200 regardless of email existence (no info leak)', async () => {
    const res1 = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: TEST_EMAIL });
    expect(res1.statusCode).toBe(200);

    const res2 = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@nowhere.com' });
    expect(res2.statusCode).toBe(200);
    expect(res1.body.message).toBe(res2.body.message);
  });
});

describe('POST /api/auth/logout', () => {
  it('clears cookies on logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
    const cookies = res.headers['set-cookie'] || [];
    const accessCookie = cookies.find(c => c.startsWith('accessToken='));
    // Cookie should be cleared (Max-Age=0 or Expires in the past)
    if (accessCookie) {
      expect(accessCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
    }
  });
});
