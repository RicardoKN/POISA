# POS System — Theming & Styling Guide

## Design Philosophy

**Soft & minimal.** The UI should feel calm, uncluttered, and effortless to use.
Staff interact with this app for hours every day — the interface should never feel noisy or tiring.
Every element earns its place. If it doesn't need to be there, remove it.

**Three principles to follow on every screen:**
1. **Breathing room** — generous padding and whitespace over tight, dense layouts
2. **Subtle depth** — soft shadows and light borders instead of harsh outlines
3. **Clear hierarchy** — one thing commands attention per screen, everything else supports it

---

## Font

**Primary font: [Figtree](https://fonts.google.com/specimen/Figtree)**
A soft, geometric sans-serif. Rounded terminals make it feel approachable without being
informal. Excellent screen legibility at small sizes — important for data-dense tables.

```html
<!-- In index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

```js
// tailwind.config.js
fontFamily: {
  sans: ['Figtree', 'ui-sans-serif', 'system-ui'],
}
```

### Type Scale

| Token | Size | Weight | Use |
|---|---|---|---|
| `text-xs` | 12px | 400 | Table meta, timestamps, labels |
| `text-sm` | 14px | 400 / 500 | Body text, form inputs, table rows |
| `text-base` | 16px | 400 / 500 | Default body, descriptions |
| `text-lg` | 18px | 600 | Section headings, card titles |
| `text-xl` | 20px | 600 | Page titles |
| `text-2xl` | 24px | 700 | KPI numbers, totals |
| `text-3xl` | 30px | 700 | Cart total, sale amount |

---

## Colour System

### Palette

```js
// tailwind.config.js — extend colors
colors: {
  // ── Backgrounds ──────────────────────────────────
  canvas:  '#F7F8FA',   // App background (outermost layer)
  surface: '#FFFFFF',   // Cards, panels, modals
  sunken:  '#F0F2F5',   // Recessed areas, input backgrounds, table stripes

  // ── Slate / Charcoal (Primary) ───────────────────
  slate: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // ── Semantic ──────────────────────────────────────
  success: '#22C55E',   // OK stock, completed sale
  warning: '#F59E0B',   // Low stock
  danger:  '#EF4444',   // Critical stock, errors
  info:    '#3B82F6',   // Neutral info

  // ── Text ─────────────────────────────────────────
  ink: {
    primary:   '#1E293B',   // Headings, important labels
    secondary: '#64748B',   // Supporting text, table meta
    muted:     '#94A3B8',   // Placeholders, disabled
    inverse:   '#FFFFFF',   // Text on dark backgrounds
  },

  // ── Borders ───────────────────────────────────────
  border: {
    DEFAULT: '#E2E8F0',   // Standard border
    strong:  '#CBD5E1',   // Focused / active borders
  },
}
```

### Colour Usage Rules

| Context | Colour to use |
|---|---|
| App background | `canvas` (#F7F8FA) |
| Cards / panels | `surface` (#FFFFFF) |
| Input background | `sunken` (#F0F2F5) |
| Primary button | `slate-800` bg, `white` text |
| Primary button hover | `slate-900` bg |
| Secondary button | `surface` bg, `slate-700` text, `border` border |
| Destructive button | `danger` bg, `white` text |
| Active nav item | `slate-800` bg, `white` text |
| Inactive nav item | transparent bg, `ink-secondary` text |
| Stock OK badge | `success` bg at 10% opacity, `success` text |
| Stock Low badge | `warning` bg at 10% opacity, `warning` text |
| Stock Critical badge | `danger` bg at 10% opacity, `danger` text |
| Table header | `sunken` bg, `ink-secondary` text |
| Table row hover | `slate-50` bg |
| Table row stripe | `F8FAFC` bg (alternating) |

---

## Spacing & Layout

### App Shell

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (220px fixed)  │  Main Content Area         │
│                         │  ┌─────────────────────┐   │
│  [Logo]                 │  │  TopBar (56px)       │   │
│                         │  ├─────────────────────┤   │
│  Nav items              │  │                     │   │
│                         │  │  Page content       │   │
│  ─────────────          │  │  p-6 padding        │   │
│  [Staff name]           │  │                     │   │
│  [Logout]               │  └─────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

- **Sidebar:** `w-[220px]` fixed, `bg-slate-900`, full height
- **Main area:** fills remaining width, `bg-canvas`, `overflow-y-auto`
- **TopBar:** `h-14` (56px), `bg-surface`, bottom border `border-border`
- **Page padding:** `p-6` on all page content wrappers
- **Section gap:** `gap-6` between major sections on a page
- **Card gap:** `gap-4` between cards in a grid

### Spacing Scale (stick to these, no custom values)

```
4px   → gap-1, p-1    (icon padding, tight badges)
8px   → gap-2, p-2    (small internal padding)
12px  → gap-3, p-3    (compact elements)
16px  → gap-4, p-4    (default card padding)
20px  → gap-5, p-5    (medium spacing)
24px  → gap-6, p-6    (page padding, section gaps)
32px  → gap-8, p-8    (large section separation)
48px  → gap-12        (major vertical rhythm breaks)
```

---

## Components

### Cards

```jsx
// Standard card
<div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
  {children}
</div>

// KPI / stat card
<div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
  <p className="text-xs font-medium text-ink-secondary uppercase tracking-wide">
    Today's Revenue
  </p>
  <p className="text-2xl font-bold text-ink-primary mt-1">BWP 1,240.00</p>
  <p className="text-xs text-ink-muted mt-1">↑ 12% vs yesterday</p>
</div>
```

### Buttons

```jsx
// Primary
<button className="
  bg-slate-800 hover:bg-slate-900
  text-white text-sm font-medium
  px-4 py-2 rounded-lg
  transition-colors duration-150
  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
">
  Save Product
</button>

// Secondary
<button className="
  bg-surface hover:bg-sunken
  text-slate-700 text-sm font-medium
  px-4 py-2 rounded-lg
  border border-border
  transition-colors duration-150
">
  Cancel
</button>

// Destructive
<button className="
  bg-danger hover:bg-red-600
  text-white text-sm font-medium
  px-4 py-2 rounded-lg
  transition-colors duration-150
">
  Void Sale
</button>

// Icon button (small)
<button className="
  p-2 rounded-lg text-ink-secondary
  hover:bg-sunken hover:text-ink-primary
  transition-colors duration-150
">
  <Icon size={16} />
</button>
```

### Inputs & Forms

```jsx
// Text input
<div className="space-y-1.5">
  <label className="text-sm font-medium text-ink-primary">
    Product Name
  </label>
  <input
    className="
      w-full bg-sunken border border-border
      rounded-lg px-3 py-2
      text-sm text-ink-primary placeholder:text-ink-muted
      focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent
      transition duration-150
    "
    placeholder="e.g. Arabica Coffee Beans"
  />
</div>

// Error state
<input className="
  w-full bg-sunken border border-danger
  rounded-lg px-3 py-2 text-sm text-ink-primary
  focus:outline-none focus:ring-2 focus:ring-danger/40
" />
<p className="text-xs text-danger mt-1">Product name is required</p>

// Select / Dropdown
<select className="
  w-full bg-sunken border border-border
  rounded-lg px-3 py-2
  text-sm text-ink-primary
  focus:outline-none focus:ring-2 focus:ring-slate-400
">
  <option>Beverages</option>
</select>
```

### Tables

```jsx
<div className="bg-surface rounded-xl border border-border overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-sunken border-b border-border">
        <th className="text-left text-xs font-semibold text-ink-secondary uppercase tracking-wide px-4 py-3">
          Product
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-slate-50 transition-colors duration-100">
        <td className="px-4 py-3 text-ink-primary">Arabica Coffee</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges / Status Pills

```jsx
// Stock status
const stockBadge = {
  ok:       'bg-green-50 text-green-700 border border-green-200',
  low:      'bg-amber-50 text-amber-700 border border-amber-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
}

<span className={`
  inline-flex items-center gap-1
  text-xs font-medium px-2 py-0.5 rounded-full
  ${stockBadge[status]}
`}>
  {status === 'ok' && '● OK'}
  {status === 'low' && '● Low'}
  {status === 'critical' && '● Critical'}
</span>
```

### Sidebar Navigation

```jsx
// Nav item — active
<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-700 text-white">
  <Icon size={18} />
  <span className="text-sm font-medium">Stock Balance</span>
</div>

// Nav item — inactive
<div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors duration-150">
  <Icon size={18} />
  <span className="text-sm font-medium">Reports</span>
</div>
```

### Toast Notifications

```jsx
// Success toast
<div className="flex items-center gap-3 bg-surface border border-border rounded-xl shadow-lg px-4 py-3 min-w-[280px]">
  <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
  <p className="text-sm text-ink-primary font-medium">Product saved successfully</p>
</div>

// Error toast
<div className="flex items-center gap-3 bg-surface border border-danger/30 rounded-xl shadow-lg px-4 py-3">
  <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
  <p className="text-sm text-ink-primary font-medium">Sale price cannot be less than cost price</p>
</div>
```

### Modals

```jsx
// Modal overlay
<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  // Modal panel
  <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md p-6">
    <h2 className="text-lg font-semibold text-ink-primary">Confirm Payment</h2>
    <p className="text-sm text-ink-secondary mt-1">Review the order before completing.</p>
    {/* content */}
    <div className="flex gap-3 mt-6">
      <button className="flex-1 ...secondary button...">Cancel</button>
      <button className="flex-1 ...primary button...">Complete Sale</button>
    </div>
  </div>
</div>
```

---

## Screen-Specific Notes

### Login Screen
- Full screen `bg-canvas`
- Centred card, `max-w-sm`, rounded-2xl, generous padding (`p-8`)
- PIN pad buttons: large (`w-14 h-14`), `bg-sunken`, `rounded-xl`, `text-lg font-semibold`
- PIN dot indicators: `w-3 h-3 rounded-full` — filled `bg-slate-800` / empty `bg-border`

### POS / Sales Screen
- **Two-column layout** — left panel (product search + grid) / right panel (cart)
- Right panel is `bg-surface` with sticky bottom total + payment button
- Cart items: compact rows, `py-3`, quantity stepper inline
- **Complete Sale button:** full width, large (`py-4`), `bg-slate-800`, `text-base font-semibold`
- Product grid cards: `rounded-xl bg-sunken hover:bg-slate-100`, soft shadow on hover

### Dashboard KPI Tiles
- 4-column grid on wide screens, 2-column on narrow
- Each tile: `bg-surface rounded-xl border border-border p-5`
- Large number in `text-2xl font-bold text-ink-primary`
- Supporting label in `text-xs uppercase tracking-wide text-ink-secondary`

### Reports Screen
- Full-width layout, no sidebar split needed
- Chart: `bg-surface rounded-xl border border-border p-5`
- Use `slate-700` as bar fill colour in Recharts
- PDF export button: top-right corner, secondary style

---

## Shadows

Use these only — no custom shadow values:

```
shadow-sm   → cards, inputs (resting state)
shadow-md   → dropdowns, tooltips, floating elements
shadow-lg   → modals, popovers
shadow-xl   → never use — too heavy for this aesthetic
```

---

## Dos & Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use generous whitespace | Cram elements together |
| Stick to the slate/charcoal palette | Add random accent colours |
| Use `rounded-lg` / `rounded-xl` consistently | Mix border radius sizes |
| Keep borders subtle (`border-border`) | Use thick or dark borders |
| Use `shadow-sm` on cards | Use heavy shadows |
| Animate with `transition-colors duration-150` | Add bounce or complex animations |
| Use Figtree throughout | Mix in system fonts |
| Format all currency via `formatters.js` | Format money inline |
| `text-ink-secondary` for supporting text | Use raw `text-gray-*` classes |

---

## Tailwind Config (complete)

```js
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,jsx}', './electron/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...fontFamily.sans],
      },
      colors: {
        canvas:  '#F7F8FA',
        surface: '#FFFFFF',
        sunken:  '#F0F2F5',
        border: {
          DEFAULT: '#E2E8F0',
          strong:  '#CBD5E1',
        },
        ink: {
          primary:   '#1E293B',
          secondary: '#64748B',
          muted:     '#94A3B8',
          inverse:   '#FFFFFF',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
}
```
