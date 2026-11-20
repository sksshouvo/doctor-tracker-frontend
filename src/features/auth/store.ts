import { create } from "zustand";
import type { User } from "@/types/api";

type Status = "unknown" | "authenticated" | "unauthenticated";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  status: Status;
  setSession: (token: string, user: User) => void;
  clear: () => void;
};

/** Memory only. The access token is never persisted (DEC-002); the refresh cookie restores sessions. */
export const useAuth = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  status: "unknown",
  setSession: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  clear: () => set({ accessToken: null, user: null, status: "unauthenticated" }),
}));
