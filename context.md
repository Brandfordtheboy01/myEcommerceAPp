# Marketplace MVP — Build Progress

## Active branch

| | |
|---|---|
| **Branch** | `mvp/marketplace-build` |
| **Git root** | `ecommerce/` (all git commands run from here) |
| **Base** | `main` |

All new MVP work happens on this branch. Do not commit directly to `main` until the MVP is ready to merge.

### Continuing later (pick up where you left off)

```bash
cd ecommerce
git fetch origin
git checkout mvp/marketplace-build
git pull origin mvp/marketplace-build   # after first push
npm install
npm run dev
```

Read this file first — it tracks what's done and what's left.

### When MVP is ready to merge

```bash
cd ecommerce
git checkout main
git pull origin main
git merge mvp/marketplace-build
git push origin main
```

Or open a PR: `mvp/marketplace-build` → `main`.

---

## Status: MVP scaffold complete (awaiting deps + Supabase setup)

## Install (you handle this)
```bash
cd ecommerce
npm install zustand
```
**Note**: `@supabase/supabase-js`, `@supabase/ssr`, and `zod` are already installed. Only `zustand` is missing.

## Done
- [x] Foundation — types, Supabase clients (browser/server/middleware), validations, format utils
- [x] `supabase/schema.sql` — corrected FK order, RLS policies, triggers (vendor orders on payment, not order insert)
- [x] `.env.example` — Supabase + Paystack keys
- [x] Auth — login, register (customer/vendor), vendor onboarding
- [x] Middleware — session check, role-based `/vendor` and `/admin` protection
- [x] Layout — header (cart badge, nav), footer
- [x] Customer flow — home (product grid), product detail, cart (Zustand), checkout (Paystack), orders list/detail, payment success/cancel
- [x] API routes — `POST /api/orders`, `POST /api/products`, `POST /api/vendors/register`, `POST /api/webhooks/paystack`, `PATCH /api/vendor/orders/[id]/status`, `GET /api/vendor/dashboard/stats`, `PATCH /api/admin/vendors/[id]`
- [x] Vendor dashboard — overview, products list, add product, orders (ship/deliver)
- [x] A# Marketplace MVP — Build Progress

## Active branch

| | |
|---|---|
| **Branch** | `mvp/marketplace-build` |
| **Git root** | `ecommerce/` (all git commands run from here) |
| **Base** | `main` |

All new MVP work happens on this branch. Do not commit directly to `main` until the MVP is ready to merge.

### Continuing later (pick up where you left off)

```bash
cd ecommerce
git fetch origin
git checkout mvp/marketplace-build
git pull origin mvp/marketplace-build   # after first push
npm install
npm run dev
```

Read this file first — it tracks what's done and what's left.

### When MVP is ready to merge

```bash
cd ecommerce
git checkout main
git pull origin main
git merge mvp/marketplace-build
git push origin main
```

Or open a PR: `mvp/marketplace-build` → `main`.

---

## Status: MVP scaffold complete (awaiting deps + Supabase setup)
- [x] Zustand (`npm install zustand`) installed successfully.
- [x] Resolved `zod` multi-version conflict (unified to `v4.4.3` via root package JSON `overrides`).
- [x] Dropped `react-paystack` package due to explicit peer conflicts and runtime failures with React 19.

## Install (you handle this)
```bash
cd ecommerce
npm install zustand
```
**Note**: `@supabase/supabase-js`, `@supabase/ssr`, and `zod` are already installed. Only `zustand` is missing.

## Done
- [x] Foundation — types, Supabase clients (browser/server/middleware), validations, format utils
- [x] `supabase/schema.sql` — corrected FK order, RLS policies, triggers (vendor orders on payment, not order insert)
- [x] `.env.example` — Supabase + Paystack keys
- [x] Auth — login, register (customer/vendor), vendor onboarding
- [x] Middleware — session check, role-based `/vendor` and `/admin` protection
- [x] Layout — header (cart badge, nav), footer
- [x] Customer flow — home (product grid), product detail, cart (Zustand), checkout (Paystack), orders list/detail, payment success/cancel
- [x] API routes — `POST /api/orders`, `POST /api/products`, `POST /api/vendors/register`, `POST /api/webhooks/paystack`, `PATCH /api/vendor/orders/[id]/status`, `GET /api/vendor/dashboard/stats`, `PATCH /api/admin/vendors/[id]`
- [x] Vendor dashboard — overview, products list, add product, orders (ship/deliver)
- [x] Admin dashboard — stats, vendor approve/reject

## Recent fixes (vendor onboarding)
- [x] Middleware no longer redirects `/api/*` to login (was breaking fetch + leaving UI stuck on "Submitting...")
- [x] Vendor register API uses service role + structured JSON logs (`lib/logger.ts`)
- [x] Auto-creates missing `public.users` row before vendor insert
- [x] Fixed Zod validation for empty optional email/phone fields
- [x] Frontend: try/catch, session check, visible errors, browser console logs



## Architecture Notes
- Vendor orders + earnings are created in the Paystack webhook (`lib/orders.ts`), not on order insert
- Orders API uses service role to insert order + items (bypasses RLS for atomic creation)
- Cart is client-side (Zustand + localStorage persist)

## App structure
```
ecommerce/
├── app/
│   ├── (auth)/login, register, vendor-register
│   ├── admin/, vendor/
│   ├── products/[id], cart, checkout, orders
│   ├── payment/success, payment/cancelled
│   └── api/...
├── components/layout, products
├── lib/supabase, validations, orders
├── store/cart-store.ts
└── supabase/schema.sql
```
dmin dashboard — stats, vendor approve/reject

## Recent fixes (vendor onboarding)
- [x] Middleware no longer redirects `/api/*` to login (was breaking fetch + leaving UI stuck on "Submitting...")
- [x] Vendor register API uses service role + structured JSON logs (`lib/logger.ts`)
- [x] Auto-creates missing `public.users` row before vendor insert
- [x] Fixed Zod validation for empty optional email/phone fields
- [x] Frontend: try/catch, session check, visible errors, browser console logs

## Remaining Until Finalisation
- [x] Install zustand (`npm install zustand`)
- [x] Create Supabase project and run `ecommerce/supabase/schema.sql`
- [ ] Fill Paystack keys in `.env.local` (NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY)
- [ ] Create first admin user manually in Supabase (`UPDATE users SET role = 'admin' WHERE email = '...'`)
- [ ] Configure Paystack webhook → `https://your-domain/api/webhooks/paystack`
- [ ] Seed test data (categories, approve a vendor, add products)
- [ ] Run `npm run dev` and smoke-test full flow
- [ ] Optional post-MVP: wishlist UI, reviews UI, coupon codes, image upload to storage, email notifications, payout requests

## Architecture Notes
- Vendor orders + earnings are created in the Paystack webhook (`lib/orders.ts`), not on order insert
- Orders API uses service role to insert order + items (bypasses RLS for atomic creation)
- Cart is client-side (Zustand + localStorage persist)

## App structure
```
ecommerce/
├── app/
│   ├── (auth)/login, register, vendor-register
│   ├── admin/, vendor/
│   ├── products/[id], cart, checkout, orders
│   ├── payment/success, payment/cancelled
│   └── api/...
├── components/layout, products
├── lib/supabase, validations, orders
├── store/cart-store.ts
└── supabase/schema.sql
```
