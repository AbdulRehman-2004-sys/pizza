# Pizza Shop POS System - Project Requirements Document (PRD)

## 1. Project Overview
The Pizza Shop Point of Sale (POS) & Management System is an all-in-one modern, cloud-enabled web application engineered specifically for pizzerias and fast-casual dining establishments. Built using Next.js 16 (App Router), TypeScript, Prisma ORM, and PostgreSQL (Neon), this application streamlines order creation, kitchen management, table ordering, billing, inventory, and business performance analytics into a singular, highly intuitive dashboard.

## 2. Business Goal
- **Maximize Order Efficiency**: Reduce customer checkout and ordering time to under 15 seconds.
- **Minimize Kitchen Errors**: Real-time kitchen display synchronization with visual order status indicators.
- **Operational Scalability**: Multi-role permission system enabling smooth workflows between admins, cashiers, and kitchen staff.
- **Actionable Insights**: Provide real-time data on daily sales, peak hours, top-selling pizzas, and cashier performance.

## 3. Target Users
- **Store Managers / Owners (Admin)**: Oversee operations, manage staff access, view financial reports, configure menu pricing/discounts.
- **Cashiers / Front Desk Staff**: Process counter, dine-in, takeaway, and phone orders fast and error-free on touchscreens or desktops.
- **Kitchen Staff**: Monitor and fulfill incoming order tickets with status updates (Pending -> Kitchen -> Ready -> Completed).

## 4. User Roles & Access Levels
| Role | Description | Core Capabilities |
| :--- | :--- | :--- |
| **Admin** | Full System Administrator | Manage users, view financial reports, edit menu items/pricing, system settings, all cashier capabilities. |
| **Cashier** | Front-of-House Operator | Take orders, process payments, view dashboard stats, track kitchen status, print receipts. |

## 5. Functional Requirements
- **Authentication & Security**: Secure login/logout via JWT stored in HttpOnly cookies with role-based access control (RBAC).
- **Dashboard & Analytics**: Real-time summary cards (Sales, Orders, Pending Kitchen, Completed) and analytics charts for revenue trends.
- **Menu & Pizza Customization (Future Phases)**: Crust types, sizes (Small, Medium, Large, XL), extra toppings, and custom pricing logic.
- **Order Processing (Future Phases)**: Fast cart management, table assignment, order modifiers, discount applications, multi-payment options (Cash, Card, QR).
- **Kitchen Display System (KDS) (Future Phases)**: Live order queue with timer badges, dish items, and status progression.
- **Receipt & Invoice Printing (Future Phases)**: Standard thermal receipt formatting for printing.

## 6. Non-Functional Requirements
- **Performance**: Sub-100ms page transitions and under 1-second API response times.
- **Touch-First Usability**: High-contrast UI elements with large touch targets minimum 48px x 48px for fast touchscreen operating.
- **Reliability**: Graceful error handling with custom boundaries and offline-friendly user feedback.
- **Security**: Password hashing using bcrypt (salt round 10), protection against XSS, CSRF, and SQL injection via Prisma.
- **Scalability**: Decoupled service layer architecture enabling easy feature additions.

## 7. Core Features & Modules
1. **Auth Module**: Login page, JWT session verification middleware, HttpOnly cookie management.
2. **Dashboard Module**: Real-time sales overview, quick actions, recent order activity feed, Recharts visual analytics.
3. **Common UI Library**: Modular buttons, drawers, modals, badges, inputs, TanStack table, pagination, skeletons, toast notifications.
4. **Order Management Module (Phase 4-7)**: Order creation, payment processing, status updates.
5. **Kitchen Module (Phase 5)**: Ticket display board for kitchen workers.
6. **Reports & Analytics (Phase 8)**: Financial summaries, export options, product performance metrics.

## 8. User Stories
- *As an Admin*, I want to log in securely so that I can view daily sales revenue and system reports.
- *As a Cashier*, I want a fast touch-screen layout so I can process customer orders quickly during rush hours.
- *As a Cashier*, I want to filter recent orders by status (Pending, Kitchen, Ready) so I can answer customer queries promptly.
- *As an Admin*, I want to assign role-based permissions so cashiers cannot alter historical financial settings.

## 9. Assumptions & Dependencies
- System runs in modern web browsers (Chrome, Edge, Safari, Firefox) on tablets, touchscreens, and desktops.
- PostgreSQL database hosted on Neon PostgreSQL with SSL connection pooling.
- Images stored locally inside `/public/uploads` for Phase 1.

## 10. Out of Scope (Phase 1)
- Multi-store franchise synchronization.
- Direct hardware driver integrations (custom serial thermal printer drivers).
- Online customer delivery tracking app (UberEats/DoorDash webhook APIs).

## 11. Acceptance Criteria (Phase 1)
- [x] Clean Next.js 16 App Router structure with TypeScript strict mode.
- [x] Prisma ORM setup with Neon PostgreSQL configuration & seed data script.
- [x] JWT Authentication with HttpOnly cookie handling.
- [x] Role-Based protection via Next.js Edge Middleware (`/admin`, `/dashboard`).
- [x] Fully responsive Restaurant Dashboard UI with cards, quick actions, Recharts charts, and TanStack Table for recent orders.
- [x] Complete set of reusable UI components (Button, Input, Modal, Dialog, Drawer, Badge, StatusChip, Table, Pagination, Skeleton, Toast).
