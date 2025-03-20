// lib/routes.ts
export interface Route {
    path: string;
    label: string;
    authRequired?: boolean;
}

export const siteRoutes: Route[] = [
    { path: '/', label: 'Home' },
    { path: '/discussions', label: 'Discussions', authRequired: true },
    { path: '/profile', label: 'Profile', authRequired: true },
];

// Use this function to get routes for the navbar
export function getNavigationRoutes(): Route[] {
    return siteRoutes;
}