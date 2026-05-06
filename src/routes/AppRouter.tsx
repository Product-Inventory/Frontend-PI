"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import AdminShell from '@/components/layout/AdminShell';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/store/auth.store';

export default function AppRouter({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isHydrated, isLoading } = useAuth();
    const isLoginSuccessPending = useAuthStore((state) => state.isLoginSuccessPending);
    // Detectar si estamos en la ruta de login
    const isLoginRoute = pathname === '/login';

    useEffect(() => {
        // Si hay sesion y se visita login, redigir al dashboard
        if (!isHydrated || isLoading || !isLoginRoute || !isAuthenticated || isLoginSuccessPending) {
            return;
        }

        router.replace('/dashboard');
    }, [isAuthenticated, isHydrated, isLoading, isLoginRoute, isLoginSuccessPending, router]);

    // Bloquear el render inicial mientras se hidrata la sesion.
    if (!isHydrated || isLoading) {
        return <Loading label="Loading application" />;
    }

    // Mostrar el login si no hay sesion, o redirigir al dashboard si ya hay sesion
    if (isLoginRoute) {
        if (isAuthenticated && isLoginSuccessPending) {
            return <>{children}</>;
        }

        return isAuthenticated ? <Loading label="Redirecting to dashboard" /> : <>{children}</>;
    }

    return (
        <ProtectedRoute>
            {/* Layout de administracion para rutas protegidas */}
            <AdminShell>{children}</AdminShell>
        </ProtectedRoute>
    );
}
