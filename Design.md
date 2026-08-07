# UI Design System & Aesthetic Guidelines

## 1. Design Philosophy
The Pizza Shop POS System UI is designed around **speed, clarity, tactile feedback, and high visual appeal**. In a fast-paced pizzeria, staff need large touch targets, immediate visual validation, and high contrast between navigation, action zones, and status indicators.

- **Theme**: Dark Slate Navigation Bar (`#0F172A`), Warm Crimson & Pizza Amber Accents (`#E11D48` / `#F97316`), Clean Light Slate Content Area (`#F8FAFC`).
- **Touch-First Target**: Minimum click/touch target size of `48px x 48px` for action buttons.
- **Micro-Animations**: Smooth `transition-all duration-200 ease-in-out` on interactive controls.

---

## 2. Color Palette
```
┌─────────────────┬─────────────────┬──────────────────────────────────────────┐
│ Token           │ Hex / Class     │ Usage Purpose                            │
├─────────────────┼─────────────────┼──────────────────────────────────────────┤
│ Brand Primary   │ #F97316 (orange)│ Primary CTA buttons, active state highlights│
│ Brand Accent    │ #E11D48 (crimson│ Critical highlights, branding accents     │
│ Sidebar Dark    │ #0F172A (slate) │ Primary navigation sidebar background    │
│ Sidebar Hover   │ #1E293B (slate) │ Active/hover navigation items            │
│ Main Canvas     │ #F8FAFC (slate) │ Application content background           │
│ Card Surface    │ #FFFFFF (white) │ Metric cards, tables, panels, modals     │
│ Text Primary    │ #0F172A (slate) │ High contrast headings and body text     │
│ Text Muted      │ #64748B (slate) │ Secondary captions, labels, breadcrumbs  │
│ Border Color    │ #E2E8F0 (slate) │ Card borders, table dividers, inputs     │
└─────────────────┴─────────────────┴──────────────────────────────────────────┘
```

---

## 3. Status Badge Color System
- **`PENDING`**: Amber Badge (`bg-amber-50 text-amber-700 border-amber-200`)
- **`KITCHEN`**: Blue Badge (`bg-blue-50 text-blue-700 border-blue-200`)
- **`READY`**: Emerald Badge (`bg-emerald-50 text-emerald-700 border-emerald-200`)
- **`COMPLETED`**: Zinc Badge (`bg-zinc-100 text-zinc-700 border-zinc-200`)
- **`CANCELLED`**: Rose Badge (`bg-rose-50 text-rose-700 border-rose-200`)

---

## 4. Typography & Spacing System
- **Primary Font**: Sans-Serif (`Inter`, `system-ui`, `-apple-system`, `sans-serif`)
- **Heading Sizes**:
  - `H1` (Page Title): `text-2xl font-bold tracking-tight text-slate-900`
  - `H2` (Card / Section Header): `text-lg font-semibold text-slate-900`
  - `H3` (Subtext): `text-sm font-medium text-slate-700`
- **Body Sizes**:
  - Regular Body: `text-sm text-slate-600`
  - Caption / Small: `text-xs text-slate-500`

---

## 5. UI Primitives & Components Specification

### Buttons
- **Primary Button**: `bg-pizza-500 hover:bg-pizza-600 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm active:scale-[0.98] transition-all`
- **Secondary Button**: `bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2.5 rounded-xl transition-all`
- **Danger Button**: `bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all`
- **Outline Button**: `border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition-all`

### Input Fields
- `w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm focus:border-pizza-500 focus:outline-none focus:ring-2 focus:ring-pizza-500/20 placeholder:text-slate-400 transition-all`

### Dashboard Metric Cards
- `bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft transition-all hover:shadow-md hover:border-slate-300`

### Tables
- Modern clean borderless content table with `border-b border-slate-100` rows, `bg-slate-50/70 text-slate-500 uppercase tracking-wider text-xs font-semibold` header, and hoverable table rows `hover:bg-slate-50/60 transition-colors`.

---

## 6. Responsive Breakpoints
- **Desktop (`lg` >= 1024px)**: Full multi-column dashboard layout with persistent dark sidebar.
- **Tablet (`md` >= 768px & < 1024px)**: Collapsible sidebar layout optimized for counter touchscreens.
- **Mobile (`sm` < 768px)**: Slide-over drawer navigation overlay triggered by navbar hamburger toggle.
