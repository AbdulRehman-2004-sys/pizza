export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "SliceMaster POS";
export const COOKIE_NAME = "token";
export const JWT_EXPIRATION = "24h";

export const ROLES = {
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  POS: "/pos",
  KITCHEN: "/kitchen",
  MENU: "/menu",
  TABLES: "/tables",
  CUSTOMERS: "/customers",
  REPORTS: "/reports",
  SETTINGS: "/settings",
  USERS: "/users",
} as const;
