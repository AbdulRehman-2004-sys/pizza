# Technical Architecture Document — SliceMaster Pizza POS

## 1. Project Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7+ (Strict Mode)
- **Frontend UI & Styling**: React 19, Tailwind CSS v3.4, Lucide React Icons
- **Database**: PostgreSQL (Neon Serverless Direct Compute Endpoint)
- **ORM**: Prisma ORM v5.22
- **Authentication**: Custom JWT (via `jose`), HttpOnly Cookies, Bcrypt Password Hashing (10 salt rounds)
- **Form Management & Validation**: React Hook Form, Zod Validation Schemas
- **State Management**: Zustand (Cart Store with activeOrderId & sentQuantity tracking)
- **Tables & Data Grids**: TanStack Table v8
- **Data Visualization**: Recharts (Sales Trends & Category Summaries)
- **Notifications**: Sonner Toasts
- **Date Handling**: date-fns v4
- **Thermal KOT & Receipt Printing**: Dedicated 80mm `@media print` CSS layouts & window.print() view generator

---

## 2. Application Workflow
```
[ Browser / Touchscreen POS ]
       │
       ├── (Auth Check via Edge Middleware) ───► [ Login Page ] (if unauthenticated)
       │
       ▼
[ Protected Layout: Dashboard Shell ]
       ├── Dark Sidebar (100vh viewport height with custom dark scrollbar & role filtering)
       ├── Top Navbar (User Profile, Quick Actions, Clock, Store Status)
       └── Main Viewport
             ├── POS Order Terminal (/pos - Touchscreen Checkout & KOT / Final Bill Buttons)
             ├── Billing & Payments (/billing - Invoice Generator & 80mm Thermal Receipt)
             ├── Order Management (/orders - Active Orders, Completed Feed & History Ledger)
             ├── Reports & Business Analytics (/reports - Server Aggregation & Charts)
             ├── User & Staff Management (/admin/users - RBAC & Admin Reset Passwords)
             ├── Menu, Categories & Pizza Config (/menu, /categories with inline size pricing)
             └── Restaurant & Table Management (/tables, /settings)
```

---

## 3. Database Models & Performance Indexes
- **`User`**: `@@index([role])`, `@@index([isActive])`
- **`MenuItem`**: `@@index([categoryId])`, `@@index([isAvailable])`
- **`Order`**: `@@index([status])`, `@@index([createdAt])`, `@@index([type])`, `@@index([cashierId])`
- **`KitchenOrder`**: `@@index([orderId])`, `@@index([status])`
- **`KitchenOrderItem`**: `kitchenOrderId`, `orderItemId`, `productName`, `sizeName`, `extraCheese`, `quantity`
- **`OrderItem`**: `@@index([orderId])`, `@@index([productId])`, `sentQuantity`
- **`Payment`**: `@@index([method])`, `@@index([paidAt])`
- **`Category`**: `categoryType` (`STANDARD` vs `PIZZA`)

---

## 4. Role Permissions Matrix
| Path / Feature | ADMIN | CASHIER |
| :--- | :---: | :---: |
| `/dashboard` (Metrics & Analytics) | ✅ | ✅ |
| `/pos` (Order Terminal & Checkout) | ✅ | ✅ |
| `/billing` (Invoices & Thermal Receipts) | ✅ | ✅ |
| `/orders` (Active & History Orders) | ✅ | ✅ |
| `/menu`, `/categories` (Inline Pizza Pricing) | ✅ | ✅ |
| `/tables` (Seating Management) | ✅ | ✅ |
| `/reports` (Business Financials & PDF) | ✅ | ❌ (403 Forbidden) |
| `/admin/users` (User Management) | ✅ | ❌ (403 Forbidden) |
| `/settings` (Store Settings) | ✅ | ❌ (403 Forbidden) |

---

## 5. Deployment Architecture
- **Web Server**: Next.js App Router deployed on Vercel / Node.js
- **Database Server**: Neon PostgreSQL (`ep-holy-recipe-aynh100v.c-5.us-east-2.aws.neon.tech`)
- **Connection Parameters**: `sslmode=require&connect_timeout=15`
