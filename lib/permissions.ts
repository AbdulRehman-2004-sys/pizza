import { UserRole } from "@/types/auth";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    "/dashboard",
    "/pos",
    "/kitchen",
    "/menu",
    "/categories",
    "/tables",
    "/pizza-config",
    "/customers",
    "/reports",
    "/settings",
    "/users",
  ],
  CASHIER: [
    "/dashboard",
    "/pos",
    "/kitchen",
    "/menu",
    "/categories",
    "/tables",
    "/pizza-config",
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
