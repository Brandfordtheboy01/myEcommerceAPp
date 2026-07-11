# Implementation Plan - Admin Dashboard Redesign

The goal is to redesign the admin dashboard of the e-commerce app (`app/admin/page.tsx`) to match the premium "Studio Admin" e-commerce dashboard template located at `/home/hnry01/Downloads/name/next-shadcn-admin-dashboard-main`.

## User Review Required

> [!IMPORTANT]
> The new admin dashboard utilizes custom charts (recharts) and rich stats from the template (Store Traffic, Traffic Sources, Customer Reviews, Top Products, Inventory, Sales Overview).
> - We will copy the mockup chart data, gauge segments, and recent orders from the template so the interface matches the requested screenshot exactly.
> - We will integrate a database-backed notification banner at the top of the dashboard to show real admin actions (like pending vendor approvals) so that no existing admin capabilities are lost.
> - We will install the `simple-icons` npm package to render brand icons (Meta, Google, Shopify, TikTok, eBay) in the traffic sources chart.

## Proposed Changes

### Dependencies

We will install `simple-icons` in the workspace:
- `npm install simple-icons`

---

### Core UI Components

We will copy the missing shadcn-like UI components from the template `src/components/ui` to the workspace `components/ui`:

#### [NEW] [toggle.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/components/ui/toggle.tsx)
Toggle component with styles.

#### [NEW] [toggle-group.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/components/ui/toggle-group.tsx)
Toggle group wrapper component.

#### [NEW] [checkbox.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/components/ui/checkbox.tsx)
Checkbox component used in tables.

#### [NEW] [pagination.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/components/ui/pagination.tsx)
Pagination buttons and helpers.

#### [NEW] [select.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/components/ui/select.tsx)
Dropdown select controls for filters.

---

### Brand Icon Component

#### [NEW] [simple-icon.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/components/simple-icon.tsx)
SVG icon renderer utilizing `simple-icons`.

---

### Admin Dashboard Page & Components

We will place the custom sub-components inside the admin folder to keep them localized:

#### [NEW] [customer-reviews.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/customer-reviews.tsx)
A reviews card showcasing the average rating, recent review text, and navigation.

#### [NEW] [inventory.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/inventory.tsx)
A gauge-style inventory card showing stock status (In stock, Low stock, Out of stock).

#### [NEW] [kpi-strip.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/kpi-strip.tsx)
A grid containing core KPIs (Sales, Orders, Growth, Return Requests, Stock Accuracy) and the Sales Overview recharts ComposedChart.

#### [NEW] [store-traffic.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/store-traffic.tsx)
A traffic area chart (Visitors vs Anomalies).

#### [NEW] [top-products.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/top-products.tsx)
A breakdown of top-selling products by category and shares.

#### [NEW] [traffic-sources.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/traffic-sources.tsx)
A horizontal bar chart showing visitors coming from Google, Meta, Shopify, TikTok, and eBay.

#### [NEW] [recent-orders.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/recent-orders.tsx)
The main dashboard table containing recent orders, status badges, pagination, and status filters.

#### [NEW] [recent-orders-table files](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/_components/recent-orders-table/)
The schema, column definitions, data, and formatters for the Recent Orders table.

#### [MODIFY] [page.tsx](file:///home/hnry01/myecormmerceapp/ecommerce/app/admin/page.tsx)
We will update the main admin page to layout all these sub-components in a responsive grid, while keeping the database check for pending vendor approvals to display an actionable notice banner when needed.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify the project compiles correctly with the new TypeScript files and dependencies.

### Manual Verification
- View the admin page in the browser to ensure layouts, colors, and charts render correctly as shown in the screenshot.
