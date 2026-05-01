import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
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
      error: null,
      setSession: (token, user) => set({ accessToken: token, user, error: null }),
      clearSession: () => set({ accessToken: null, user: null, error: null, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
      setError: (error) => set({ error }),
      hasPermission: (permission: string) => {
        const user = get().user;

        if (!user) {
          return false;
        }
        
        return user.permissions.includes(permission) || user.role.toLowerCase() === 'admin';
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