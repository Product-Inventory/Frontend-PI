"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    type ReactNode,
} from 'react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type { LoginRequest, LoginResponse, User } from '@/types/auth';

// Definicion del valor del contexto de autenticacion
type AuthContextValue = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isHydrated: boolean;
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    logout: () => void;
};

// Contexto compartido en toda la app.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Estado y acciones desde el store de auth
    const token = useAuthStore((state) => state.accessToken);
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);
    const isHydrated = useAuthStore((state) => state.isHydrated);
    const setSession = useAuthStore((state) => state.setSession);
    const clearSession = useAuthStore((state) => state.clearSession);
    const setLoading = useAuthStore((state) => state.setLoading);
    const setError = useAuthStore((state) => state.setError);

    useEffect(() => {
        // Hidratar el usuario si hay token pero no info de usuario
        if (!isHydrated || !token || user) {
            return;
        }

        // Evita setState si el efecto ya esta limpio
        let isActive = true;

        // Valida el token actual y obtiene info del usuario
        const hydrateSession = async () => {
            setLoading(true);
            setError(null);

            try {
                const currentUser = await authService.getMe();

                if (!isActive) {
                    return;
                }

                setSession(token, currentUser);
            } catch (error) {
                if (!isActive) {
                    return;
                }
                // Si falla la validacion, limpia la sesion local
                setError(error instanceof Error ? error.message : 'No se pudo validar la sesión');
                clearSession();
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        void hydrateSession();

        return () => {
            isActive = false;
        };
    }, [clearSession, isHydrated, setError, setLoading, setSession, token, user]);

    // Inicia sesion y guarda token/usuario en el store
    const login = useCallback(
        async (credentials: LoginRequest) => {
            setLoading(true);
            setError(null);

            try {
                const session = await authService.login(credentials);
                setSession(session.token, session.user);
                return session;
            } catch (error) {
                setError(error instanceof Error ? error.message : 'No se pudo iniciar sesión');
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [setError, setLoading, setSession],
    );

    // Limpia la sesion local
    const logout = useCallback(() => {
        clearSession();
    }, [clearSession]);

    // Memoriza el valor del contexto para evitar renders extra
    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(token && user),
            isLoading,
            isHydrated,
            login,
            logout,
        }),
        [isHydrated, isLoading, login, logout, token, user],
    );
    // Proporciona el contexto a los componentes hijos
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Para consumir el contexto de autenticacion
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
