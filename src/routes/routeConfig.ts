/*
 * Configuración de las rutas
 * Define las rutas disponibles, permisos requeridos, autenticación y visibilidad en el sidebar
 * También incluye funciones para validar acceso de usuarios según sus permisos y rol
 * Aun no se implementa
 */

import type { User } from '@/types/auth';

function normalizePermission(permission: string) {
    return permission.toLowerCase().replace(/\./g, ':');
}

// Configuracion base de cada ruta dentro de la app.
export type AppRouteConfig = {
    path: string;
    label: string;
    module?: string; 
    permissions?: string[];
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
        module: 'dashboard',
        permissions: ['dashboard:read'],
        requiresAuth: false,
        showInSidebar: true,
    },
    {
        path: '/users',
        label: 'Users',
        module: 'users',
        permissions: ['users:read', 'users:create', 'users:update', 'users:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/roles',
        label: 'Roles',
        module: 'roles',
        permissions: ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/permissions',
        label: 'Permissions',
        module: 'permissions',
        permissions: ['permissions:read', 'permissions:create', 'permissions:update', 'permissions:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/clients',
        label: 'Clients',
        module: 'clients',
        permissions: ['clients:read', 'clients:create', 'clients:update', 'clients:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/suppliers',
        label: 'Suppliers',
        module: 'suppliers',
        permissions: ['suppliers:read', 'suppliers:create', 'suppliers:update', 'suppliers:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/products',
        label: 'Products',
        module: 'products',
        permissions: ['products:read', 'products:create', 'products:update', 'products:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/inventory',
        label: 'Inventory',
        module: 'inventory',
        permissions: ['inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/orders',
        label: 'Orders',
        module: 'orders',
        permissions: ['orders:read', 'orders:create', 'orders:update', 'orders:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/recepciones',
        label: 'Recepciones',
        module: 'recepciones',
        permissions: ['recepciones:read', 'recepciones:create', 'recepciones:update', 'recepciones:delete'],
        requiresAuth: true,
        showInSidebar: true,
    },
    {
        path: '/audit',
        label: 'Audit',
        module: 'audit',
        permissions: ['audit:read', 'audit:create'],
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

    if (!route.permissions) {
        return true;
    }

    // Verifica si el usuario tiene alguno de los permisos requeridos para la ruta
    const normalizedUserPermissions = user.permissions.map(normalizePermission);
    return route.permissions.some((permission) => normalizedUserPermissions.includes(normalizePermission(permission)));
}

// Filtrar rutas visibles segun permisos y estado de usuario
export function getAccessibleRoutes(user: User | null | undefined) {
    return routeConfig.filter((route) => route.showInSidebar && canAccessRoute(user, route));
}

export function getDefaultRoute(user: User | null | undefined) {
    return getAccessibleRoutes(user)[0]?.path ?? '/login';
}

// Obtener la configuracion de ruta por path exacto o prefijo
export function getRouteByPath(pathname: string) {
    return routeConfig.find((route) => route.path === pathname || pathname.startsWith(`${route.path}/`));
}
