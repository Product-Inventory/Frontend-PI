import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

function normalizePermission(permission: string) {
  return permission.toLowerCase().replace(/\./g, ':');
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  isLoginSuccessPending: boolean;
  error: string | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setLoginSuccessPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      isHydrated: false,
      isLoginSuccessPending: false,
      error: null,
      setSession: (token, user) => set({ accessToken: token, user, error: null }),
      clearSession: () =>
        set({
          accessToken: null,
          user: null,
          error: null,
          isLoading: false,
          isLoginSuccessPending: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      setLoginSuccessPending: (pending) => set({ isLoginSuccessPending: pending }),
      setError: (error) => set({ error }),
      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        if (user.role && user.role.toLowerCase() === 'admin') return true;
        const perm = normalizePermission(permission);
        const perms = (user.permissions || []).map(normalizePermission);
        return perms.includes(perm);
      },
    }),
    {
      name: 'product-inv-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated(true);
        }
      },
    },
  ),
);