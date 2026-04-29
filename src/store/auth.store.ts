import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';
interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setSession: (token: string, user: User) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (permission: string) => boolean; // Para ocultar módulos según RBAC
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isLoading: false,
      error: null,
      setSession: (token, user) => set({ accessToken: token, user, error: null }),
      clearSession: () => set({ accessToken: null, user: null, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        return user.permissions.includes(permission) || user.role === 'ADMIN';
      }
    }),
    { name: 'product-inv-auth' }
  )
);