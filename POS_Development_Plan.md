# Retail POS System — Development Plan
**Project:** Custom Desktop Point of Sale Application
**Platform:** Desktop (Electron + React + SQLite)
**Total Duration:** 11 Weeks
**Last Updated:** February 2026

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Development Phases](#4-development-phases)
5. [Module Specifications](#5-module-specifications)
6. [Database Schema](#6-database-schema)
7. [Role & Permissions Matrix](#7-role--permissions-matrix)
8. [Testing Plan](#8-testing-plan)
9. [Deployment Checklist](#9-deployment-checklist)
10. [Coding Standards](#10-coding-standards)

---

## 1. Project Overview

A custom-built desktop POS application for a retail shop. The system replaces manual/spreadsheet-based stock and sales tracking with a fast, reliable, multi-staff application.

**Core Modules:**
- Stock Input (new products + restocking)
- Stock Balances (live inventory view)
- Sales Input (POS transaction screen)
- Weekly Reports (stock + revenue summaries)
- Staff Management (logins + role permissions)

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Desktop Shell | Electron.js | Cross-platform, runs on Windows/Mac as native app |
| Frontend UI | React 18 | Component-based, fast UI updates |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| Database | SQLite (via better-sqlite3) | Local, zero-config, no server needed |
| ORM / Queries | Knex.js | Clean query builder, easy migrations |
| PDF Export | jsPDF + jsPDF-AutoTable | Client-side PDF generation |
| Receipt Print | Electron print API | Direct to connected thermal/desktop printer |
| Charts (Reports) | Recharts | Lightweight React chart library |
| State Management | Zustand | Simple, minimal boilerplate |
| Build Tool | Vite | Fast HMR in development |
| Packaging | electron-builder | Produces .exe installer for Windows |

---

## 3. Project Structure

```
pos-app/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Context bridge (IPC)
│   └── db/
│       ├── database.js      # SQLite connection
│       ├── migrations/      # Schema migrations (Knex)
│       └── seeds/           # Dev seed data
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Router + auth wrapper
│   ├── store/               # Zustand global state
│   │   ├── authStore.js
│   │   ├── stockStore.js
│   │   └── salesStore.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── StockInput.jsx
│   │   ├── StockBalance.jsx
│   │   ├── Sales.jsx
│   │   ├── Reports.jsx
│   │   └── StaffManagement.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── stock/
│   │   │   ├── AddProductForm.jsx
│   │   │   ├── RestockForm.jsx
│   │   │   └── StockTable.jsx
│   │   ├── sales/
│   │   │   ├── ProductSearch.jsx
│   │   │   ├── CartPanel.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   └── Receipt.jsx
│   │   └── reports/
│   │       ├── WeeklySummary.jsx
│   │       ├── SalesChart.jsx
│   │       └── StockMovementTable.jsx
│   ├── hooks/
│   │   ├── useStock.js
│   │   ├── useSales.js
│   │   └── useReports.js
│   └── utils/
│       ├── pdf.js           # PDF generation helpers
│       ├── formatters.js    # Currency, date formatters
│       └── validators.js    # Form validation helpers
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── electron-builder.yml
```

---

## 4. Development Phases

### Phase 1 — Discovery & Setup `Week 1`

**Goals:** Project environment ready, database schema finalised, all dependencies installed.

**Tasks:**
- [ ] Initialise Electron + React + Vite project
- [ ] Configure Tailwind CSS
- [ ] Set up SQLite with Knex and run initial migrations
- [ ] Create folder structure as defined above
- [ ] Set up electron-builder configuration for Windows packaging
- [ ] Create dev seed data (sample products, staff accounts)
- [ ] Configure IPC bridge between Electron main and renderer processes
- [ ] Kickoff meeting with client — confirm all requirements

**Deliverable:** Running skeleton app that opens a blank window on launch.

---

### Phase 2 — UI/UX Design `Weeks 2–3`

**Goals:** All 6 screens designed, approved by client before development continues.

**Tasks:**
- [ ] Design all screens in Figma (or equivalent):
  - Login / PIN screen
  - Manager Dashboard
  - Stock Input form
  - Stock Balance table
  - POS / Sales screen
  - Weekly Reports screen
- [ ] Define design tokens: colour palette, typography scale, spacing, component styles
- [ ] Share designs with client for review
- [ ] Incorporate client feedback (1 round of revisions included)
- [ ] Finalise and sign off on designs before Phase 3 begins

**Deliverable:** Approved screen designs. Development does not start until client sign-off.

---

### Phase 3 — Core Development `Weeks 4–6`

**Goals:** Authentication, stock input, and stock balance screens fully functional.

#### Week 4 — Auth & Navigation
- [ ] Build Login screen with PIN pad UI
- [ ] Implement staff authentication logic (PIN lookup, session management)
- [ ] Set up protected routes — redirect unauthenticated users to Login
- [ ] Build sidebar navigation with role-based menu items (Manager sees all, Cashier sees subset)
- [ ] Build TopBar with logged-in staff name, current date/time, logout button
- [ ] Manager Dashboard shell (KPI tiles stubbed with placeholder data)

#### Week 5 — Stock Input Module
- [ ] Add Product form (all fields, validation, duplicate check)
- [ ] Restock Existing form (product search/select + quantity input)
- [ ] Supplier and purchase date capture
- [ ] Write database handlers: `insertProduct`, `restockProduct`, `getProductById`
- [ ] Success/error feedback toasts on form submission
- [ ] Unit tests for stock insert and restock logic

#### Week 6 — Stock Balance Module
- [ ] Stock balance table with all products and current quantities
- [ ] Search and filter (by name, category)
- [ ] Sortable columns (name, quantity, value)
- [ ] Low stock alert highlighting (configurable minimum threshold per product)
- [ ] Stock valuation totals (cost value + retail value) in footer
- [ ] Export current stock list as CSV
- [ ] Wire up Manager Dashboard KPI tiles with live data

**Deliverable:** Auth, Stock Input, and Stock Balance fully working end-to-end.

---

### Phase 4 — Sales & Reports `Weeks 7–9`

**Goals:** POS sales screen and weekly reports engine complete with PDF export.

#### Week 7 — Sales Screen (Part 1)
- [ ] Product search bar with live results
- [ ] Product grid / quick-select panel
- [ ] Cart panel — add items, update quantities, remove items
- [ ] Line total and cart total calculations
- [ ] Discount field (fixed BWP or percentage) at item and cart level

#### Week 8 — Sales Screen (Part 2) + Receipt
- [ ] Payment modal — Cash (with change calculator), Card, Mixed
- [ ] Complete Sale action:
  - Insert sale record to database
  - Insert sale line items
  - Deduct quantities from stock in real time
- [ ] Receipt generation (on-screen preview + print)
- [ ] Sale history — view past transactions for the day
- [ ] Write database handlers: `insertSale`, `insertSaleItems`, `updateStockOnSale`

#### Week 9 — Weekly Reports
- [ ] Date range picker (defaults to current Mon–Sun week)
- [ ] Sales summary: total revenue, transactions, average sale value, gross profit
- [ ] Sales by day bar chart (Recharts)
- [ ] Top 10 products by revenue and by units sold
- [ ] Stock movement table: opening stock → sold → restocked → closing stock
- [ ] PDF export (jsPDF + AutoTable) — branded report layout
- [ ] Print report directly from app

**Deliverable:** Full POS flow working. Sales processed, stock updates in real time, reports generated.

---

### Phase 5 — Staff Management & Polish `Week 10`

**Goals:** Staff admin complete, UI polished, edge cases handled.

- [ ] Staff management screen (Manager only):
  - View all staff
  - Add new staff (name, role, PIN)
  - Edit staff details
  - Deactivate staff account
- [ ] Activity log — every sale and stock entry tagged with staff ID and timestamp
- [ ] UI polish pass — spacing, typography, colour consistency across all screens
- [ ] Loading states and error boundaries on all data-fetching components
- [ ] Empty states (e.g. no products yet, no sales today)
- [ ] Keyboard navigation support on POS screen (Tab, Enter for speed)

---

### Phase 6 — Testing & QA `Week 10 (parallel)`

> See [Testing Plan](#8-testing-plan) for full details.

- [ ] Run all unit tests — stock, sales, auth logic
- [ ] End-to-end workflow testing (full sale cycle, stock deduction check)
- [ ] Edge case testing (zero stock, duplicate products, incorrect PIN)
- [ ] Client UAT (User Acceptance Testing) session
- [ ] Bug fix sprint based on UAT feedback
- [ ] Performance check — large product catalogues (500+ items)

---

### Phase 7 — Deployment `Week 11`

**Goals:** App installed on client machines, staff trained, documentation handed over.

- [ ] Run `electron-builder` to generate Windows `.exe` installer
- [ ] Test installer on clean Windows machine
- [ ] Install application on client PCs (up to 2 machines)
- [ ] Seed initial data: product catalogue, staff accounts
- [ ] Configure printer connection for receipts
- [ ] Half-day staff training session:
  - Manager walkthrough (all modules)
  - Cashier walkthrough (sales + stock view)
  - Q&A
- [ ] Hand over User Manual (PDF)
- [ ] Hand over source code (zipped or via Git repo)
- [ ] 14-day post-launch support window begins

---

## 5. Module Specifications

### 5.1 Stock Input

| Field | Type | Required | Notes |
|---|---|---|---|
| Product Name | Text | Yes | Must be unique |
| Category | Dropdown | Yes | Predefined list + "Other" |
| Barcode | Text | No | Manual entry or scan |
| Cost Price | Number (BWP) | Yes | Must be > 0 |
| Sale Price | Number (BWP) | Yes | Must be >= Cost Price |
| Initial Quantity | Integer | Yes | For new products only |
| Restock Quantity | Integer | Yes | For restocks only |
| Supplier | Text | No | |
| Purchase Date | Date | Yes | Defaults to today |

**Business Rules:**
- Duplicate product name triggers a warning, not a hard block (manager can override)
- Sale price cannot be lower than cost price without manager confirmation
- Restock entries are logged separately to stock audit trail

---

### 5.2 Stock Balance

**Display columns:** Product Name | Category | In Stock | Min Level | Cost Value | Retail Value | Status

**Status logic:**
- 🔴 **Critical** — quantity at 0
- 🟠 **Low** — quantity below minimum threshold
- 🟢 **OK** — quantity at or above threshold

**Default minimum threshold:** 5 units (configurable per product)

---

### 5.3 Sales / POS

**Sale lifecycle:**
```
Search Product → Add to Cart → Apply Discount (optional)
→ Select Payment Method → Confirm Sale
→ Stock Deducted → Receipt Generated → Sale Saved
```

**Payment methods:** Cash | Card | Mixed (split)

**Discount types:** Percentage (%) | Fixed Amount (BWP)

**Receipt includes:** Shop name, date/time, cashier name, itemised list, subtotal, discount, total, payment method, change (if cash)

---

### 5.4 Weekly Reports

**Report sections:**
1. **Header** — week range, generated date, generated by (staff name)
2. **Sales Summary** — revenue, transactions, avg sale, COGS, gross profit
3. **Daily Breakdown** — revenue per day with bar chart
4. **Top Products** — by revenue and by units sold
5. **Stock Movement** — per product: open → sold → restocked → close
6. **Footer** — export timestamp

---

## 6. Database Schema

```sql
-- Staff
CREATE TABLE staff (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK(role IN ('manager', 'cashier')),
  pin         TEXT NOT NULL,
  is_active   INTEGER DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  category      TEXT,
  barcode       TEXT,
  cost_price    REAL NOT NULL,
  sale_price    REAL NOT NULL,
  quantity      INTEGER DEFAULT 0,
  min_threshold INTEGER DEFAULT 5,
  is_active     INTEGER DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stock Entries (audit trail for all stock movements)
CREATE TABLE stock_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  type        TEXT NOT NULL CHECK(type IN ('initial', 'restock', 'sale', 'adjustment')),
  quantity    INTEGER NOT NULL,   -- positive = stock in, negative = stock out
  supplier    TEXT,
  notes       TEXT,
  staff_id    INTEGER REFERENCES staff(id),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sales
CREATE TABLE sales (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  subtotal        REAL NOT NULL,
  discount_amount REAL DEFAULT 0,
  total           REAL NOT NULL,
  payment_method  TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'mixed')),
  cash_tendered   REAL,
  change_given    REAL,
  staff_id        INTEGER REFERENCES staff(id),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sale Line Items
CREATE TABLE sale_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id     INTEGER NOT NULL REFERENCES sales(id),
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  REAL NOT NULL,
  discount    REAL DEFAULT 0,
  line_total  REAL NOT NULL
);

-- Settings
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

---

## 7. Role & Permissions Matrix

| Feature | Manager | Cashier |
|---|:---:|:---:|
| Login | ✅ | ✅ |
| View Stock Balances | ✅ | ✅ |
| Process Sales | ✅ | ✅ |
| Add New Product | ✅ | ❌ |
| Restock Product | ✅ | ❌ |
| Edit Product Details | ✅ | ❌ |
| View Weekly Reports | ✅ | ❌ |
| Export PDF Reports | ✅ | ❌ |
| Manage Staff Accounts | ✅ | ❌ |
| View Activity Log | ✅ | ❌ |
| Change App Settings | ✅ | ❌ |
| Apply Sale Discounts | ✅ | ✅ |
| Void / Cancel a Sale | ✅ | ❌ |

---

## 8. Testing Plan

### Unit Tests
- Auth: correct PIN accepts, wrong PIN rejects, lockout after 5 attempts
- Stock: insert product, restock quantity, duplicate name warning
- Sales: cart total calculation, discount application, change calculation
- Reports: weekly date range logic, revenue aggregation

### Integration Tests
- Full sale cycle: add to cart → pay → stock quantity decreases
- Restock flow: restock form → stock_entries insert → product quantity increases
- Report generation: sales data → correct weekly totals

### UAT Scenarios (with client)
- [ ] Cashier logs in, processes a 3-item sale with mixed payment, prints receipt
- [ ] Manager adds a new product, checks it appears in stock balance
- [ ] Manager restocks an existing product, verifies quantity updates
- [ ] Manager generates a weekly report and exports as PDF
- [ ] Manager creates a new cashier account and tests their login
- [ ] Low stock alert appears when product drops below threshold

### Edge Cases
- [ ] Sale attempted when product has 0 stock — should block with error
- [ ] Duplicate product name on add — warning shown
- [ ] Incorrect PIN 5 times — account lockout for 10 minutes
- [ ] Report generated for a week with no sales — empty state shown gracefully
- [ ] Application launched with no products seeded — onboarding prompt shown

---

## 9. Deployment Checklist

### Pre-Deployment
- [ ] All UAT issues resolved and signed off by client
- [ ] Database migrations run and tested on clean machine
- [ ] `electron-builder` produces valid `.exe` installer
- [ ] Installer tested on a Windows machine not used for development
- [ ] Printer connectivity tested (receipt printing)
- [ ] Initial product catalogue loaded (if client provides data)
- [ ] All staff accounts created with agreed PINs

### On-Site Installation
- [ ] Install app on PC 1 (primary till)
- [ ] Install app on PC 2 (manager station, if applicable)
- [ ] Confirm database file location and backup folder configured
- [ ] Test full sale on each machine
- [ ] Confirm receipt prints correctly on each machine
- [ ] Confirm report generation and PDF export works

### Handover
- [ ] Source code delivered (zipped / Git repo link)
- [ ] User Manual PDF handed over
- [ ] Manager trained on all modules
- [ ] Cashier(s) trained on sales and stock view
- [ ] Support contact details provided
- [ ] 14-day post-launch support window confirmed and start date noted

---

## 10. Coding Standards

### General
- Use **functional components** only — no class components
- All database calls go through **IPC handlers** in `electron/main.js` — never call SQLite directly from React
- Use **Zustand stores** for global state — no prop drilling
- All monetary values stored as **REAL (float)** in the database, displayed formatted via `formatters.js`

### Naming Conventions
- Components: `PascalCase` (e.g. `CartPanel.jsx`)
- Functions / variables: `camelCase` (e.g. `handleAddToCart`)
- Database tables: `snake_case` (e.g. `sale_items`)
- Constants: `UPPER_SNAKE_CASE` (e.g. `MAX_PIN_ATTEMPTS`)

### Git Workflow
- `main` — production-ready code only
- `develop` — integration branch
- `feature/[name]` — individual features (e.g. `feature/sales-screen`)
- Commit messages: `[module]: short description` (e.g. `sales: add discount calculation`)
- Pull request required before merging into `develop`

### Error Handling
- All IPC calls wrapped in `try/catch` with meaningful error messages returned to renderer
- Form validation runs client-side before any database call is made
- Database errors logged to a local `error.log` file in the app data directory

---

*Development Plan v1.0 — Retail POS System*
*For internal use and client reference*

