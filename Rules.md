# Development Rules & Coding Standards

## 1. Golden Rules (Non-Negotiable)
1. **NO `any` TYPES**: TypeScript strict mode is enabled. All data structures, API responses, props, and variables must be explicitly typed.
2. **NO Direct Database Queries in UI Components**: UI components must fetch data through API services or Server Component props. Never import `prisma` in client components.
3. **NO Code Duplication**: Extract common business logic into `services/` and validation logic into `validators/`.
4. **NO Raw Unvalidated User Input**: All form submissions and API body payloads MUST be validated using Zod schemas (`validators/`).
5. **NO Foreign Styling Frameworks**: Use Tailwind CSS exclusively. Material UI, Bootstrap, and Chakra UI are strictly forbidden.
6. **NO External Backend Services**: Everything must reside inside the Next.js single repository structure (`/app/api`). Express, NestJS, Supabase, and Firebase are strictly forbidden.

---

## 2. Naming Conventions
- **Files & Folders**: Kebab-case (`user-nav.tsx`, `sales-cards.tsx`, `auth-service.ts`).
- **Components**: PascalCase (`Button`, `SalesCards`, `LoginForm`).
- **Functions & Variables**: camelCase (`formatCurrency`, `getUserSession`, `isLoading`).
- **Types & Interfaces**: PascalCase (`User`, `OrderStatus`, `ApiResponse<T>`).
- **Database Tables & Fields**: camelCase in Prisma models (`orderNumber`, `totalAmount`, `cashierId`).
- **API Endpoints**: Plural kebab-case REST nouns (`/api/auth/login`, `/api/dashboard/stats`).

---

## 3. Component Architecture Rules
- Use Server Components by default. Add `'use client'` at the top of a file ONLY when interactive features (React hooks `useState`, `useEffect`, event handlers `onClick`) are required.
- Keep components small, focused, and pure. Single responsibility principle.
- Use explicit TypeScript `interface` or `type` definitions for all component props.
- Use `clsx` and `tailwind-merge` (`cn()` utility) for conditional class names.

---

## 4. API & Error Handling Rules
- All Route Handlers (`/app/api/.../route.ts`) must wrap operations in `try / catch` blocks.
- API endpoints must return structured JSON responses with explicit HTTP status codes:
  - `200 OK`: Successful fetch or update.
  - `201 Created`: Resource successfully created.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Unauthenticated request.
  - `403 Forbidden`: Insufficient role permissions.
  - `404 Not Found`: Target entity missing.
  - `500 Internal Server Error`: Unhandled server exception.
- Never leak database connection string or sensitive server error tracebacks to the client.

---

## 5. Security & Auth Rules
- Authentication tokens MUST be stored inside `HttpOnly`, `SameSite=Lax`, `Secure` cookies. Never store tokens in `localStorage` or `sessionStorage`.
- Password hashes MUST use `bcryptjs` with a minimum salt round of 10.
- All protected API handlers and client pages MUST check user authorization role before returning sensitive data.

---

## 6. Allowed vs Forbidden Libraries
### Allowed Libraries
- Framework: Next.js 16 (App Router)
- DB/ORM: PostgreSQL, Prisma ORM
- State: Zustand
- Forms/Validation: React Hook Form, Zod
- Data/Tables: TanStack Table
- Charts: Recharts
- Toasts: Sonner
- Icons: Lucide React
- Utilities: date-fns, clsx, tailwind-merge, jose, bcryptjs

### Forbidden Libraries
- Express / NestJS / Fastify
- Redux / MobX / Recoil
- Material UI / Bootstrap / Chakra UI / Ant Design
- Firebase / Supabase / Appwrite
- MongoDB / Mongoose
