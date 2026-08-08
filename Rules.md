# Development Rules & Coding Standards

## 1. Golden Rules (Non-Negotiable)
1. **NO `any` TYPES**: TypeScript strict mode is enabled. All data structures, API responses, props, and variables must be explicitly typed.
2. **NO Direct Database Queries in UI Components**: UI components must fetch data through API services or Server Component props. Never import `prisma` in client components.
3. **NO Code Duplication**: Extract common business logic into `services/` and validation logic into `validators/`.
4. **NO Raw Unvalidated User Input**: All form submissions and API body payloads MUST be validated using Zod schemas (`validators/`).
5. **NO Foreign Styling Frameworks**: Use Tailwind CSS exclusively. Material UI, Bootstrap, and Chakra UI are strictly forbidden.
6. **NO External Backend Services**: Everything must reside inside the Next.js single repository structure (`/app/api`). Express, NestJS, Supabase, and Firebase are strictly forbidden.
7. **NO Payment Gateway Integration**: All payment methods (`CASH`, `CARD`, `JAZZCASH`, `EASYPAISA`) are records only.
8. **NO Image Upload Placeholders**: Product cards and menu modals must work cleanly without requiring image uploads or showing empty upload boxes.

---

## 2. POS & KOT Workflow Rules
1. **Dual Button POS**: POS checkout uses two distinct buttons: **[ KOT ]** and **[ FINAL BILL ]**. Never combine or replace them with a single "Place Order" button.
2. **Incremental KOT Tracking**: Track `sentQuantity` per `OrderItem`. When KOT is clicked on an open order with new/additional items, print ONLY the newly added items or incremental quantities.
3. **No Empty KOT Tickets**: Never create an empty `KitchenOrder` if there are no unsent items (`quantity <= sentQuantity`). Show a clear notification to the cashier instead.
4. **Order Persistence**: KOT generation keeps the active order OPEN on the POS screen. Final Bill processes payment, marks order COMPLETED, releases dining tables, prints customer receipts, and clears the active POS order.
5. **Category Pizza Pricing**: Manage pizza sizes (Small, Medium, Large) and extra pricing directly inside the Category module popups without requiring external configuration pages.

---

## 3. Component Architecture Rules
- Use Server Components by default. Add `'use client'` at the top of a file ONLY when interactive features (React hooks `useState`, `useEffect`, event handlers `onClick`) are required.
- Keep components small, focused, and pure. Single responsibility principle.
- Use explicit TypeScript `interface` or `type` definitions for all component props.
- Use `clsx` and `tailwind-merge` (`cn()` utility) for conditional class names.

---

## 4. API & Error Handling Rules
- All Route Handlers (`/app/api/.../route.ts`) must wrap operations in `try / catch` blocks.
- API endpoints must return structured JSON responses with explicit HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
- Never leak sensitive server tracebacks to the client.
