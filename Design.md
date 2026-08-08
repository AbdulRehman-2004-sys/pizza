# UI Design System & Aesthetic Guidelines

## 1. Design Philosophy
The Pizza Shop POS System UI is designed around **speed, clarity, tactile feedback, and high visual appeal**. In a fast-paced pizzeria, staff need large touch targets, immediate visual validation, and high contrast between navigation, action zones, and status indicators.

- **Theme**: Dark Slate Navigation Bar (`#0F172A`), Warm Crimson & Pizza Amber Accents (`#E11D48` / `#F97316`), Clean Light Slate Content Area (`#F8FAFC`).
- **Touch-First Target**: Minimum click/touch target size of `48px x 48px` for action buttons.
- **Micro-Animations**: Smooth `transition-all duration-200 ease-in-out` on interactive controls.

---

## 2. Color Palette & Action Buttons
```
┌─────────────────┬─────────────────┬──────────────────────────────────────────┐
│ Token           │ Hex / Class     │ Usage Purpose                            │
├─────────────────┼─────────────────┼──────────────────────────────────────────┤
│ Brand Primary   │ #F97316 (orange)│ Primary CTA buttons, active state highlights│
│ Brand Accent    │ #E11D48 (crimson│ Critical highlights, branding accents     │
│ KOT Action      │ #F97316 (orange)│ KOT kitchen slip trigger button          │
│ Final Bill CTA  │ #059669 (emerald│ Final billing and payment trigger button │
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

## 3. POS Button Specification
- **`KOT Button`**: `bg-pizza-500 hover:bg-pizza-600 text-white font-black text-sm px-4 py-3 rounded-xl shadow-lg shadow-pizza-500/25 active:scale-[0.98]`
- **`FINAL BILL Button`**: `bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-[0.98]`

---

## 4. Status Badge Color System
- **`PENDING`**: Amber Badge (`bg-amber-50 text-amber-700 border-amber-200`)
- **`KITCHEN`**: Blue Badge (`bg-blue-50 text-blue-700 border-blue-200`)
- **`READY`**: Emerald Badge (`bg-emerald-50 text-emerald-700 border-emerald-200`)
- **`COMPLETED`**: Zinc Badge (`bg-zinc-100 text-zinc-700 border-zinc-200`)
- **`CANCELLED`**: Rose Badge (`bg-rose-50 text-rose-700 border-rose-200`)
- **`SENT KOT ITEM`**: Blue Pill (`bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded`)
- **`UNSENT KOT ITEM`**: Amber Pill (`bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded`)

---

## 5. 80mm Thermal Slip Layouts
- **Kitchen Order Ticket (KOT)**: 80mm narrow thermal width, high-contrast monochrome typography, clear quantity badges (`2x`), item sizes, extra cheese, toppings, and special instructions. Excludes subtotal, tax, discount, grand total, and payment info.
- **Customer Final Receipt**: 80mm thermal width, restaurant header, invoice #, order #, date/time, cashier name, order type & table #, itemized prices, subtotal, tax, discount, grand total, payment method, and receipt footer message.
