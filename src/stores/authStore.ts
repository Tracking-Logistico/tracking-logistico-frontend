import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import type { LoginResponse, Role } from "@/types/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  panel: string | null;
  accessTokenExpiresAt: string | null;
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  signIn: (email: string, password: string) => Promise<LoginResponse>;
  signOut: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      panel: null,
      accessTokenExpiresAt: null,
      isHydrated: false,
      setHydrated: (isHydrated) => set({ isHydrated }),
      signIn: async (email, password) => {
        const session = await api.login(email, password);
        setSession(set, session);
        return session;
      },
      signOut: async () => {
        const token = get().accessToken;
        try {
          if (token) await api.logout(token);
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            role: null,
            panel: null,
            accessTokenExpiresAt: null,
          });
        }
      },
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          role: null,
          panel: null,
          accessTokenExpiresAt: null,
        }),
    }),
    {
      name: "logistrack-session",
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

function setSession(
  set: (state: Partial<AuthState>) => void,
  session: LoginResponse,
) {
  set({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    role: session.rol,
    panel: session.panel,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
  });
}
