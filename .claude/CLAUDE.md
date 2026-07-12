# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Backend (`server/`):
```bash
npm run dev     # nodemon src/index.js — http://localhost:5000
npm start        # node src/index.js
npm test         # jest --runInBand — all tests, hits the real MONGO_URI from server/.env
npx jest tests/auth.test.js       # single test file
npx jest -t "rejects duplicate"   # single test by name
```

Frontend (`client/`):
```bash
npm run dev      # next dev — http://localhost:3000
npm run build
npm run lint
```

Tests use `server/.env`'s live MongoDB connection (no in-memory DB/mocking), so `npm test` writes and cleans up real documents — see the `afterAll` cleanup pattern in `server/tests/*.test.js` (regex-delete emails ending in `.test`) when adding new tests.

## Architecture

ShopSmart is a **multi-tenant** storefront platform, not a single shop: each `Store` document (`server/src/models/Store.js`) has an `owner` (a `shopowner` user) and a unique `slug`, and stores full branding/theme config (colors, font, hero banner, announcement bar, currency/locale) applied live via CSS variables on the frontend — no redeploy needed. Note the README describes an earlier two-role (`customer`/`admin`) design; the actual `User.role` enum is `customer | shopowner | admin` (`server/src/models/User.js`), and store-scoped management endpoints are guarded with `requireRole('shopowner', 'admin')`.

Two parallel store-facing route groups exist server-side:
- `server/src/routes/store.routes.js` (mounted at `/api/store`) — the current shopowner's own store: `/mine/data`, `/analytics`, `/products`, `PATCH /:id`. Route order matters here — static paths (`/analytics`, `/products`, `/mine/data`) are declared before the catch-all `/:slug` to avoid being shadowed.
- `server/src/routes/stores.routes.js` (mounted at `/api/stores`) — public browsing of *any* store by slug: `/:slug`, `/:slug/products`, `/:slug/products/:id`, plus nested product reviews.

Auth is JWT-based via HttpOnly cookies (`accessToken`), with `server/src/middleware/auth.middleware.js` exposing `verifyToken` (required) and `optionalAuth` (attaches `req.user` if present, e.g. for guest checkout). Role checks are a separate middleware (`role.middleware.js`'s `requireRole(...roles)`) layered on top of `verifyToken`.

Client-side, `client/context/` holds three providers (`AuthContext`, `CartContext`, `StoreContext`) that wrap the app; `StoreContext` is what resolves the active store's branding and feeds the CSS-variable theming. Cart state persists to `localStorage`, not the backend, so guest checkout works without an account. `client/app/store/[slug]/` is the public per-tenant storefront route; `client/app/dashboard/` is the shopowner's own management UI (distinct from `client/app/admin/`, which is the platform-wide admin panel for user/store management across all tenants).

`client/proxy.js` currently has an empty matcher (`config.matcher: []`), so no Next.js middleware-based route protection is active — auth gating happens in the page/context layer instead.
