export type userRole = 'ADMIN' | 'DONOR' | 'ORGANIZATION';

export interface NavItem {
    title: string;
    route: string;
    roles: userRole[];
    icon?: string;
}

export const Sidebuttons: NavItem[] = [
    { title: 'Iniciar sesión', route: '/login', roles: ['DONOR', 'ORGANIZATION'], icon: '😉' },
    { title: 'Registrarse', route: '/register', roles: ['DONOR', 'ORGANIZATION'], icon: '🙊' },
    { title: 'Panel de Administración', route: '/admin', roles: ['ADMIN'], icon: '🏚️' },
    { title: 'Mi Perfil', route: '/profile', roles: ['DONOR', 'ORGANIZATION'], icon: '👋' },
    { title: 'Cerrar sesión', route: '/logout', roles: ['DONOR', 'ORGANIZATION', 'ADMIN'], icon: '🔒' }
];