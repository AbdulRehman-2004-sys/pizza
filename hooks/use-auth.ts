import { create } from "zustand";
import { UserSession } from "@/types/auth";

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          set({ user: json.data.user });
        } else {
          set({ user: null });
        }
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
}));
