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
    {
        title: 'Organizaciones', roles: ['DONOR', 'ORGANIZATION', 'ADMIN'], icon: 'community', children: [
            { title: 'Registrar organización', route: '/organizations/register', roles: ['DONOR'], icon: 'add' },
            { title: 'Mi organización', route: '/organizations/my-organizations', roles: ['ORGANIZATION'], icon: 'diversity-1' },
        ]
        
    },
    { title: 'ONGs pendientes', route: '/organizations/pending', roles: ['ADMIN'], icon: 'admin' },
    {
        title: 'Campañas', roles: ['ADMIN'], icon: 'diversity-1', children: [
            { title: 'Crear campaña', route: '/campaigns/create', roles: ['ORGANIZATION'], icon: 'add' },
            { title: 'Descubrir campañas', route: '/campaigns/all', roles: ['ADMIN', 'DONOR', 'ORGANIZATION'], icon: 'search' },
        ]
    },
    { title: 'Mis donaciones', roles: ['DONOR'], route: '/donations/all', icon: 'volunteer-activism' }
    ,
    {
        title: 'Dashboards', route: '/dashboards/admin', roles: ['ADMIN'], icon: 'bar-chart-4-bars'
    },
    {
        title: 'Dashboards', route: '/dashboards/organization', roles: ['ORGANIZATION'], icon: 'bar-chart-4-bars'
    },
];