export type UserRole = "ADMIN" | "CASHIER";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserSession;
  token?: string;
}
