# ShopSmart

A multi-tenant e-commerce platform that gives small businesses their own branded storefront with full personalization — no code required.

**Live Demo:** _deploy your own instance using the steps below_

---

## Team

| Name | Roll No |
|------|---------|
| Seerat E Zahra | 23i-0640 |
| Minahil Kashif | 23i-0554 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.2.4 · React 19 · Tailwind CSS v4 · Framer Motion 12 |
| Backend | Node.js · Express 5 · JWT (HttpOnly cookies) |
| Database | MongoDB Atlas · Mongoose 9 |
| Auth | Access tokens + refresh tokens · bcryptjs |
| Email | Nodemailer (password reset flow) |
| Testing | Jest · Supertest (25 tests) |
| Deployment | Vercel (frontend) · Render / Railway (backend) |

---

## Features

### Authentication
- Register / login / logout with JWT stored in HttpOnly cookies
- Forgot password + reset password via email link (Nodemailer)
- Role-based access control: `customer` and `admin` roles
- Protected routes — unauthenticated users redirected to login

### Products
- Public paginated product listing with search and category filters
- Product detail page with stock status and add-to-cart
- Admin: create, edit, soft-delete products (never hard-deleted)
- Image URL support with Next.js remote image patterns

### Cart & Checkout
- Persistent cart via localStorage (survives page refresh)
- Cart badge with animated count in Navbar
- Checkout form with shipping address
- Guest checkout supported (no account required)
- Stock validation at order creation

### Orders
- Order creation decrements product stock atomically
- Authenticated users can view their order history
- Admin order management dashboard

### Admin Dashboard
- Analytics overview (users, products, orders, revenue)
- User management: activate/deactivate accounts, change roles
- Product and order management tables

### Store Personalization (Tier 2)
Admins configure their storefront through a 4-tab settings panel. All changes apply live via CSS variables — no redeploy needed.

| Setting | Options |
|---------|---------|
| Brand color | Any hex color |
| Accent color | Any hex color |
| Font family | Inter, Poppins, Playfair Display, Space Grotesk, DM Sans |
| Theme | Minimal · Bold · Elegant · Playful |
| Color scheme | Light · Dark · System (follows OS preference) |
| Hero banner | Headline, subtext, CTA text + URL, background image |
| Announcement bar | Text, background color, enable/disable |
| Product grid | 2-column or 3-column layout |
| Store info | Name, tagline, logo, contact email, phone, address |
| Social links | Instagram, Facebook, Twitter |
| Currency & locale | Used in all price displays |

---

## Project Structure

```
ShopSmart/
├── server/               # Express API
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── controllers/  # auth, products, orders, admin, store
│   │   ├── middleware/   # JWT verification, role guard
│   │   ├── models/       # User, Product, Order, Store
│   │   ├── routes/       # auth, products, orders, admin, store
│   │   ├── utils/        # email helper
│   │   └── index.js      # app entry point
│   └── tests/            # Jest + Supertest (25 tests)
├── client/               # Next.js app
│   ├── app/
│   │   ├── page.js                    # Home — hero + featured products
│   │   ├── products/                  # Listing + detail pages
│   │   ├── cart/                      # Cart page
│   │   ├── checkout/                  # Checkout form
│   │   ├── orders/                    # Order history + detail
│   │   ├── auth/                      # Login, register, forgot/reset password
│   │   └── admin/                     # Dashboard, products, orders, users, store-settings
│   ├── components/       # Navbar, Footer, ProductCard, ProductGrid, AnnouncementBar, …
│   ├── context/          # AuthContext, CartContext, StoreContext
│   ├── lib/              # axios instance, themes, formatPrice
│   └── proxy.js          # Next.js route protection
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- A Gmail account for password reset emails (or any SMTP provider)

### 1. Clone

```bash
git clone https://github.com/seerat-e-zahra/ShopSmart.git
cd ShopSmart
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shopsmart
JWT_SECRET=your_jwt_secret_here
REFRESH_TOKEN_SECRET=your_refresh_secret_here
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

> For Gmail, generate an [App Password](https://myaccount.google.com/apppasswords) — do not use your account password.

```bash
npm run dev        # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
npm run dev        # starts on http://localhost:3000
```

### 4. Verify

```bash
curl http://localhost:5000/api/health
# → {"status":"ok"}
```

Open `http://localhost:3000`. Register an account, then in MongoDB Atlas set `role: "admin"` on your user document to access the admin panel.

---

## Running Tests

```bash
cd server
npm test
```

25 tests covering:
- **Auth**: register (valid, duplicate, weak password), login, `/me`, forgot-password, logout
- **Products**: CRUD, pagination, search, category filter, soft delete, 401/403 guards

---

## Deployment

### Backend (Render / Railway)

1. Push this repo to GitHub and create a new web service
2. Set **Root Directory** to `server`, build command `npm install`, start command `node src/index.js`
3. Add these environment variables:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | random secret |
| `REFRESH_TOKEN_SECRET` | random secret |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | Gmail App Password |
| `CLIENT_URL_PROD` | your Vercel URL (set after frontend deploy) |

### Frontend (Vercel)

1. Import your GitHub repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-backend-url/api`
4. Deploy

### After both are live

Set `CLIENT_URL_PROD` on the backend to your Vercel URL so CORS accepts production requests.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, sets HttpOnly cookie |
| POST | `/api/auth/logout` | — | Clears cookie |
| GET | `/api/auth/me` | cookie | Current user |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Reset with token |
| GET | `/api/products` | — | Paginated list (search, category, page) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | admin | Create product |
| PUT | `/api/products/:id` | admin | Update product |
| DELETE | `/api/products/:id` | admin | Soft delete |
| POST | `/api/orders` | optional | Create order (guest or user) |
| GET | `/api/orders/my` | user | My orders |
| GET | `/api/orders/:id` | user | Order detail |
| GET | `/api/admin/users` | admin | All users |
| PUT | `/api/admin/users/:id/role` | admin | Change role |
| PUT | `/api/admin/users/:id/status` | admin | Toggle active |
| GET | `/api/admin/analytics` | admin | Stats |
| GET | `/api/store/default` | — | Store config (used by frontend) |
| PUT | `/api/store` | admin | Update store settings |
| GET | `/api/health` | — | Health check |
