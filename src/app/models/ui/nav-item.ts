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
    //PERFIL
    { title: 'Mi perfil', route: '/profile', roles: ['DONOR', 'ORGANIZATION', 'ADMIN'], icon: 'person' },

    //ORGANIZACIONES
    { title: 'Mi organización', route: '/organizations/my-organizations', roles: ['DONOR', 'ORGANIZATION'], icon: 'diversity-1' },
    { title: 'ONGs pendientes', route: '/organizations/pending', roles: ['ADMIN'], icon: 'admin' },

    //CAMPAÑAS

    { title: 'Crear campaña', route: '/campaigns/create', roles: ['ORGANIZATION'], icon: 'add' },


    //DONACIONES
    { title: 'Mis donaciones', roles: ['DONOR'], route: '/donations/all', icon: 'volunteer-activism' }
    ,

    //PAYOUTS
    { title: 'Mis pagos', roles: ['ORGANIZATION'], route: '/payouts/my-payouts', icon: 'payment' },
    { title: 'Solicitudes de pago', roles: ['ADMIN'], route: '/payouts/pending-payouts', icon: 'payment' },

    //GRAFICOS
    {
        title: 'Dashboards', route: '/dashboards/admin', roles: ['ADMIN'], icon: 'bar-chart-4-bars'
    },
    {
        title: 'Dashboards', route: '/dashboards/organization', roles: ['ORGANIZATION'], icon: 'bar-chart-4-bars'
    },
];