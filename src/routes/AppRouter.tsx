"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import AdminShell from '@/components/layout/AdminShell';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';

export default function AppRouter({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isHydrated, isLoading } = useAuth();
    // Detectar si estamos en la ruta de login
    const isLoginRoute = pathname === '/login';

    useEffect(() => {
        // Si hay sesion y se visita login, redigir al dashboard
        if (!isHydrated || isLoading || !isLoginRoute || !isAuthenticated) {
            return;
        }

        router.replace('/dashboard');
    }, [isAuthenticated, isHydrated, isLoading, isLoginRoute, router]);

    // Bloquear el render inicial mientras se hidrata la sesion.
    if (!isHydrated || isLoading) {
        return <Loading label="Loading application" />;
    }

    // Mostrar el login si no hay sesion, o redirigir al dashboard si ya hay sesion
    if (isLoginRoute) {
        return isAuthenticated ? <Loading label="Redirecting to dashboard" /> : <>{children}</>;
    }

    return (
        <ProtectedRoute>
            {/* Layout de administracion para rutas protegidas */}
            <AdminShell>{children}</AdminShell>
        </ProtectedRoute>
    );
}
