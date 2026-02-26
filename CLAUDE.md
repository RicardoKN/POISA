# Retail POS System — Claude Code Context

## Project Summary
Custom desktop Point of Sale app for a retail shop. Replaces manual stock and sales tracking.
Built with **Electron + React + SQLite**. Multi-staff with role-based access (Manager / Cashier).

**Full development plan:** `docs/POS_Development_Plan.md`

---

## Commands

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run Electron in dev mode
npm run electron:dev

# Run tests
npm test

# Build Windows installer
npm run build

# Run database migrations
npm run migrate

# Seed dev data
npm run seed
```

---

## Architecture — Critical Rules

1. **Never call SQLite from React.** All DB access goes through IPC handlers in `electron/main.js` only.
2. **IPC is the API.** React calls `window.electronAPI.methodName()` via the preload bridge — treat it like a REST call.
3. **Zustand for global state.** No prop drilling. Stores live in `src/store/`.
4. **Functional components only.** No class components anywhere.
5. **All money is stored as REAL (float) in the DB.** Always display via `formatters.js` — never format inline.
6. **Form validation runs client-side first** before any IPC call is made.
7. **All IPC handlers use try/catch** and return `{ success, data, error }` shaped responses.

---

## Project Structure

```
pos-app/
├── electron/
│   ├── main.js              # IPC handlers + app lifecycle
│   ├── preload.js           # Context bridge — exposes electronAPI to renderer
│   └── db/
│       ├── database.js      # SQLite connection (better-sqlite3)
│       ├── migrations/      # Knex migration files
│       └── seeds/           # Dev seed data
├── src/
│   ├── App.jsx              # Router + auth wrapper
│   ├── store/               # Zustand stores (auth, stock, sales)
│   ├── pages/               # One file per screen
│   ├── components/          # Reusable UI — grouped by module (layout/, stock/, sales/, reports/)
│   ├── hooks/               # useStock, useSales, useReports
│   └── utils/
│       ├── formatters.js    # Currency (BWP), dates
│       ├── validators.js    # Form validation
│       └── pdf.js           # jsPDF report helpers
```

---

## Database Schema (SQLite)

```sql
staff        — id, name, role (manager|cashier), pin, is_active, created_at
products     — id, name, category, barcode, cost_price, sale_price, quantity, min_threshold, is_active
stock_entries— id, product_id, type (initial|restock|sale|adjustment), quantity, supplier, staff_id, created_at
sales        — id, subtotal, discount_amount, total, payment_method, cash_tendered, change_given, staff_id, created_at
sale_items   — id, sale_id, product_id, quantity, unit_price, discount, line_total
settings     — key, value
```

---

## Roles & Permissions

| Action | Manager | Cashier |
|---|:---:|:---:|
| Login | ✅ | ✅ |
| View stock / process sales | ✅ | ✅ |
| Apply discounts | ✅ | ✅ |
| Add / restock / edit products | ✅ | ❌ |
| View reports + export PDF | ✅ | ❌ |
| Manage staff accounts | ✅ | ❌ |
| Void a sale | ✅ | ❌ |
| Change app settings | ✅ | ❌ |

---

## Module: Stock Input

- **New product fields:** name (unique), category, barcode, cost_price, sale_price, quantity, supplier, purchase_date
- Duplicate name → warning toast, manager can override
- Sale price < cost price → confirmation required before saving
- On save: insert to `products` + insert `stock_entries` record (type: 'initial')

## Module: Stock Balance

- Table columns: Product | Category | In Stock | Min Level | Cost Value | Retail Value | Status
- Status: 🔴 Critical (qty = 0) | 🟠 Low (qty < min_threshold) | 🟢 OK
- Default min_threshold = 5 (configurable per product)
- Footer shows total cost value and total retail value of all stock

## Module: Sales / POS

Sale lifecycle:
```
Search product → Add to cart → Apply discount (optional)
→ Select payment (Cash / Card / Mixed) → Confirm sale
→ Deduct stock → Save sale + line items → Print receipt
```
- Block sale if product qty = 0
- Receipt: shop name, date/time, cashier name, line items, subtotal, discount, total, payment method, change

## Module: Weekly Reports

Sections: Sales summary → Daily breakdown (bar chart) → Top 10 products → Stock movement table
- Default date range: current Mon–Sun
- Export as PDF via jsPDF + AutoTable

---

## Naming Conventions

- Components: `PascalCase` → `CartPanel.jsx`
- Functions/vars: `camelCase` → `handleAddToCart`
- DB tables/columns: `snake_case` → `sale_items`
- Constants: `UPPER_SNAKE_CASE` → `MAX_PIN_ATTEMPTS`
- Commit format: `[module]: description` → `sales: add discount calculation`

---

## Git Branches

- `main` — production only
- `develop` — integration
- `feature/[name]` — all feature work, PR into develop

---

## Current Phase

> **Update this section at the start of each session.**

**Phase:** [x] Phase 1 — Setup | [x] Phase 2 — Design | [x] Phase 3 — Core Dev | [x] Phase 4 — Sales & Reports | [ ] Phase 5 — Polish

**Current week focus:**
- [x] Week 4 — Auth & navigation
- [x] Week 5 — Stock Input module
- [x] Week 6 — Stock Balance module
- [x] Week 7 — Sales screen (product grid, cart, discounts)
- [x] Week 8 — Payment modal, receipt, sale history
- [x] Week 9 — Weekly reports + PDF export

**Last completed:**
- Sales IPC: create sale (transaction with stock deduction), get all/by ID, void sale (restores stock)
- Reports IPC: weekly summary, daily breakdown, top 10 by revenue/units, stock movement
- POS Sales screen: product grid, cart with add/remove/qty stepper, item + cart discounts (BWP/%)
- PaymentModal: cash (quick-fill + change calc), card, mixed (split)
- Receipt: on-screen preview with print support
- Sale history: today's transactions modal
- Weekly Reports: date range picker, 5 KPI tiles, Recharts bar chart, top products, stock movement table
- PDF export via jsPDF + AutoTable (branded layout with header, tables, page numbers)

**Blocked on:**
- *(none)*

---

## Known Decisions & Gotchas

- **Windows only for now** — electron-builder configured for `.exe`. Mac not in scope v1.
- **No internet required** — fully offline app, SQLite is local.
- **PIN lockout** — 5 failed attempts locks account for 10 minutes. Stored in memory (not DB).
- **Stock deduction is immediate** on sale confirmation — no "pending" state.
- **Receipts print via Electron print API** — no third-party print library needed.
- **Reports are generated fresh on demand** — no pre-computed aggregates.
- **Google Drive backup is out of scope for v1** — planned as a future upsell module.

---

## Theming & Styling

Full styling guide: `docs/STYLING.md` — read it before writing any UI code.

**Quick rules:**
- Font: **Figtree** (Google Fonts) — loaded in `index.html`
- Theme: **Soft & minimal** — generous whitespace, subtle shadows, no harsh borders
- Palette: **Slate/charcoal** primary — `slate-800` for primary actions, `canvas`/`surface`/`sunken` for backgrounds
- App background: `bg-canvas` (#F7F8FA) | Cards: `bg-surface` (#FFFFFF) | Inputs: `bg-sunken` (#F0F2F5)
- Borders: always `border-border` (#E2E8F0) — never hard black borders
- Shadows: `shadow-sm` on cards, `shadow-md` on dropdowns/tooltips, `shadow-lg` on modals
- Border radius: `rounded-lg` for inputs/buttons, `rounded-xl` for cards/panels
- Text: `text-ink-primary` / `text-ink-secondary` / `text-ink-muted` — never raw `text-gray-*`
- Transitions: `transition-colors duration-150` on interactive elements — no bounce animations
- All currency formatted via `formatters.js` — never format money inline
