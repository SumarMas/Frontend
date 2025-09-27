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
    { title: 'Mi perfil', route: '/login', roles: ['DONOR', 'ORGANIZATION'], icon: 'person' },
    { title: 'Organizaciones', route: '/register', roles: ['DONOR', 'ORGANIZATION'], icon: 'group' },
    { title: 'Campañas', route: '/admin', roles: ['ADMIN'], icon: 'volunteer-activism' },
    { title: 'Donaciones', roles: ['DONOR'], icon: 'volunteer-activism', open: false, children: [
        { title: 'Mis donaciones', route: '/donations', roles: ['DONOR'], icon: 'chat' },
        { title: 'Realizar donación', route: '/donate', roles: ['DONOR'], icon: 'check' },
    ]},
    { title: 'Dashboards', route: '/dashboards', roles: ['ADMIN', 'ORGANIZATION'], icon: 'bar-chart-4-bars'
    },
];