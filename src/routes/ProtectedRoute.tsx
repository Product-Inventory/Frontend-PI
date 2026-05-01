"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
    children: ReactNode;
    redirectTo?: string;
    fallback?: ReactNode;
};

// Wrapper que protege rutas y manejar redireccion a login
export default function ProtectedRoute({
    children,
    redirectTo = '/login',
    fallback = <Loading />,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isHydrated, isLoading } = useAuth();

    useEffect(() => {
        // Evita redireccionar hasta que la sesion este hidratada y lista
        if (!isHydrated || isLoading || isAuthenticated) {
            return;
        }

        router.replace(redirectTo);
    }, [isAuthenticated, isHydrated, isLoading, redirectTo, router]);

    // Mientras se hidrata o carga, se muestra el fallback
    if (!isHydrated || isLoading) {
        return <>{fallback}</>;
    }

    // Si no hay sesion valida mostrar el fallback
    if (!isAuthenticated) {
        return <>{fallback}</>;
    }

    // Si hay sesion, renderiza los hijos
    return <>{children}</>;
}
