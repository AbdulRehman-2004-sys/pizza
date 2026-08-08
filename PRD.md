# Pizza Shop POS System - Project Requirements Document (PRD)

## 1. Project Overview
The Pizza Shop Point of Sale (POS) & Management System is an all-in-one modern, cloud-enabled web application engineered specifically for pizzerias and fast-casual dining establishments. Built using Next.js 16 (App Router), TypeScript, Prisma ORM, and PostgreSQL (Neon), this application streamlines order creation, kitchen ticketing (KOT), table ordering, billing, inventory, and business performance analytics into a singular, highly intuitive dashboard.

## 2. Business Goal
- **Maximize Order Efficiency**: Reduce customer checkout and ordering time to under 15 seconds.
- **Minimize Kitchen Errors**: Dual-button KOT & Final Bill workflow with 80mm thermal kitchen tickets.
- **Incremental Order Support**: Allow cashiers to add items or increase quantities on active open orders with incremental KOT generation printing only new items.
- **Actionable Insights**: Provide real-time data on daily sales, peak hours, top-selling pizzas, and cashier performance.

## 3. Target Users
- **Store Managers / Owners (Admin)**: Oversee operations, manage staff access, view financial reports, configure menu pricing and pizza sizes inside Category management.
- **Cashiers / Front Desk Staff**: Process counter, dine-in, takeaway, and phone orders fast and error-free on touchscreens or desktops with dedicated KOT and Final Bill buttons.

## 4. POS Workflow Engine
```
SELECT ORDER TYPE
        ↓
SELECT TABLE / CUSTOMER IF REQUIRED
        ↓
ADD ITEMS
        ↓
KOT (Generates & Prints 80mm Kitchen Slip for Unsent Items; Order Remains Open)
        ↓
CUSTOMER MAY ADD MORE ITEMS / INCREASE QUANTITIES
        ↓
KOT AGAIN (Prints ONLY Incremental/Newly Added Items)
        ↓
FINAL BILL (Opens Payment Modal: Cash, Card, JazzCash, Easypaisa)
        ↓
PAYMENT & TABLE RELEASE
        ↓
PRINT FINAL RECEIPT (80mm Customer Receipt & Clear Cart)
```

## 5. Functional Requirements
- **Authentication & Security**: Secure login/logout via JWT stored in HttpOnly cookies with role-based access control (RBAC).
- **POS Terminal**: Dual button workflow ([KOT] and [FINAL BILL]), incremental quantity tracking, table selection, customer auto-lookup.
- **80mm Thermal Printing**: Browser `window.print()` with `@media print` CSS layout for kitchen slips (KOT) and customer final receipts.
- **Category & Pizza Configuration**: Manage pizza categories and size-based prices (Small, Medium, Large) directly inside Categories popup modals.
- **Order Management & History**: Track active, kitchen, and completed orders with debounced search, date filters, and audit trail.
- **Reports & Business Analytics**: Daily/monthly sales analytics, top-selling items, payment method breakdown, PDF export, and CSV export.

## 6. Non-Functional Requirements
- **Performance**: Sub-100ms page transitions and under 1-second API response times.
- **Touch-First Usability**: High-contrast UI elements with large touch targets minimum 48px x 48px for fast touchscreen operating.
- **Reliability**: Graceful error handling with custom boundaries and offline-friendly user feedback.
- **Security**: Password hashing using bcrypt (salt round 10), protection against XSS, CSRF, and SQL injection via Prisma.

## 7. Out of Scope
- Direct USB hardware printer drivers (browser `window.print()` media styles are used).
- External payment gateway API integrations (payment methods are records only).
- Online customer app (UberEats/DoorDash webhooks).
