/*
 * Configuración de las rutas
 * Define las rutas disponibles, permisos requeridos, autenticación y visibilidad en el sidebar
 * También incluye funciones para validar acceso de usuarios según sus permisos y rol
 * Aun no se implementa
 */

import type { User } from '@/types/auth';

// Configuracion base de cada ruta dentro de la app.
export type AppRouteConfig = {
    path: string;
    label: string;
    permission?: string;
    requiresAuth?: boolean;
    showInSidebar?: boolean;
};

// Rutas publicas que no requieren autenticacion.
export const publicRoutes = ['/login'];

// Definicion centralizada de rutas, permisos y visibilidad en sidebar.
export const routeConfig: AppRouteConfig[] = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        requiresAuth: false,
        showInSidebar: true,
    },
    {
        path: '/users',
        label: 'Users',
        permission: 'users.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/roles',
        label: 'Roles',
        permission: 'roles.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/permissions',
        label: 'Permissions',
        permission: 'permissions.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/clients',
        label: 'Clients',
        permission: 'clients.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/suppliers',
        label: 'Suppliers',
        permission: 'suppliers.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/products',
        label: 'Products',
        permission: 'products.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/inventory',
        label: 'Inventory',
        permission: 'inventory.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/orders',
        label: 'Orders',
        permission: 'orders.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/recepciones',
        label: 'Recepciones',
        permission: 'recepciones.view',
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/audit',
        label: 'Audit',
        permission: 'audit.view',
        requiresAuth: true,
        showInSidebar: true,
    },
];

// El rol admin tiene acceso total
export function isAdmin(user: User | null | undefined) {
    return user?.role?.toLowerCase() === 'admin';
}

// Decidir si el usuario puede acceder a una ruta dada
export function canAccessRoute(user: User | null | undefined, route: AppRouteConfig) {
    if (!user) {
        return false;
    }

    if (isAdmin(user)) {
        return true;
    }

    if (!route.permission) {
        return true;
    }

    // Verifica si el usuario tiene el permiso requerido para la ruta
    return user.permissions.includes(route.permission);
}

// Filtrar rutas visibles segun permisos y estado de usuario
export function getAccessibleRoutes(user: User | null | undefined) {
    return routeConfig.filter((route) => route.showInSidebar && canAccessRoute(user, route));
}

// Obtener la configuracion de ruta por path exacto o prefijo
export function getRouteByPath(pathname: string) {
    return routeConfig.find((route) => route.path === pathname || pathname.startsWith(`${route.path}/`));
}
