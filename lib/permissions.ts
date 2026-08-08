import { UserRole } from "@/types/auth";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    "/dashboard",
    "/pos",
    "/orders",
    "/categories",
    "/tables",
    "/customers",
    "/reports",
    "/settings",
    "/admin/users",
  ],
  CASHIER: [
    "/dashboard",
    "/pos",
    "/orders",
    "/categories",
    "/tables",
    "/customers",
  ],
};

export function hasPermission(role: UserRole, path: string): boolean {
  const allowedPaths = ROLE_PERMISSIONS[role] || [];
  return allowedPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`));
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isCashier(role: UserRole): boolean {
  return role === "CASHIER";
}
