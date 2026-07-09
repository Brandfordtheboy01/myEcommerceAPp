# Marketplace MVP

A multi-vendor e-commerce platform built with Next.js, Supabase, and Paystack.

## Status

**MVP complete** — UI redesign in progress on `feature/ui-redesign` branch.

## Features

### Core Functionality (MVP)
- **Authentication**: Login, registration (customer/vendor), vendor onboarding
- **Customer Flow**: Home, product detail, cart (Zustand), checkout (Paystack), orders list/detail
- **Vendor Dashboard**: Overview, products management, order fulfillment (ship/deliver)
- **Admin Dashboard**: Statistics, vendor approval/rejection
- **Post-MVP Features**: Wishlist, reviews, coupons, image upload

### UI/UX Redesign (in progress)
- Design system with indigo primary palette and warm backgrounds
- DM Sans + DM Serif Display typography
- Improved layouts: split-panel auth, two-column checkout, dashboard sidebars
- Enhanced components: product cards with hover effects, status badges, loading skeletons

## Getting Started

### Prerequisites
- Node.js
- Supabase project with configured schema
- Paystack API keys

### Installation

```bash
cd ecommerce
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and configure:
- Supabase URL and anon/service keys
- Paystack public and secret keys

### Database Setup

Run the schema setup:
```bash
# Apply schema.sql to your Supabase project
# See supabase/schema.sql for full schema definition
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Branch Strategy

- `main` — stable production branch
- `mvp/marketplace-build` — MVP functionality (complete)
- `feature/ui-redesign` — UI/UX improvements (current work)

Merge flow: `feature/ui-redesign` → `mvp/marketplace-build` → `main`

## Architecture

### Tech Stack
- **Frontend**: Next.js (App Router), React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **Payments**: Paystack
- **State**: Zustand (cart)

### Key Design Decisions
- Vendor orders + earnings created in Paystack webhook (not on order insert)
- Orders API uses service role for atomic order + items creation (bypasses RLS)
- Cart is client-side (Zustand + localStorage persistence)
- Home page supports `?search=` and `?category=` query params for filtering

### Project Structure

```
ecommerce/
├── app/
│   ├── (auth)/          # login, register, vendor-register
│   ├── admin/           # admin dashboard (+ layout.tsx)
│   ├── vendor/          # vendor dashboard (+ layout.tsx)
│   ├── products/[id]    # product detail
│   ├── cart, checkout   # shopping flow
│   ├── orders, wishlist # customer features
│   ├── payment/         # success/cancelled pages
│   └── api/             # API routes
├── components/
│   ├── layout/          # container, page-header, auth-shell, dashboard-nav
│   ├── products/        # product-card, product-search, category-filter
│   └── ui/              # shadcn components
├── lib/                 # supabase clients, validations, orders, logger
├── store/               # cart-store.ts
└── supabase/            # schema.sql, migrations
```

## Known Issues

- **ngrok in production**: Currently configured with ngrok for local development. Determine if ngrok is needed in production or if proper domain/SSL setup is required.
- **Order status not updating**: When vendor marks order as delivered, the `order_status` field in the `orders` table is not being updated. Investigation needed.

## Post-MVP Features (Optional)

- [x] Wishlist UI
- [x] Reviews UI
- [x] Coupon codes (vendor-managed, server-validated at checkout)
- [x] Image upload to storage
- [ ] Email notifications
- [ ] Payout requests
- [ ] Dedicated search results page

## Coupon Feature

Vendors create/manage coupons at `/vendor/coupons` (approved vendors only). Each coupon is tied to `vendor_id` — discount applies only to that vendor's cart items. Checkout validates via `POST /api/coupons/validate` (preview) and `POST /api/orders` (server-side apply).

## Deployment

Recommended deployment on Vercel:
```bash
npm run build
```

Ensure environment variables are configured in production before deploying.
