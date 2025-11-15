export type userRole = 'ADMIN' | 'DONOR' | 'ORGANIZATION';

export interface NavItem {
    title: string;
    route?: string;
    roles: userRole[];
    icon?: string;
    children?: NavItem[];
    open?: boolean;
}

export const Sidebuttons: NavItem[] = [
    { title: 'Mi perfil', route: '/profile', roles: ['DONOR', 'ORGANIZATION', 'ADMIN'], icon: 'person' },
    { title: 'Organizaciones', roles: ['DONOR', 'ORGANIZATION'], icon: 'community', children:[
        { title: 'Registrar organización', route: '/organizations/register', roles: ['DONOR', 'ORGANIZATION'], icon: 'add' },
        { title: 'Mis organizaciones', route: '/organizations/my-organizations', roles: ['DONOR', 'ORGANIZATION'], icon: 'diversity-1' },
        { title: 'Gestionar pendientes', route: '/organizations/pending', roles: ['ADMIN'], icon: 'admin' },
    ] },
    { title: 'Campañas', roles: ['ADMIN'], icon: 'diversity-1', children: [
        { title: 'Crear campaña', route: '/campaigns/create', roles: ['ADMIN'], icon: 'add' },
        { title: 'Descubrir campañas', route: '/campaigns/all', roles: ['ADMIN'], icon: 'search' },
    ] },
    { title: 'Donaciones', roles: ['DONOR'], icon: 'volunteer-activism', children: [
        { title: 'Mis donaciones', route: '/donations/all', roles: ['DONOR'], icon: 'chat' }
    ]},
    { title: 'Dashboards', route: '/dashboards', roles: ['ADMIN', 'ORGANIZATION'], icon: 'bar-chart-4-bars'
    },
];