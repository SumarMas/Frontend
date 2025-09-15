export type userRole = 'ADMIN' | 'DONOR' | 'ORGANIZATION';

export interface NavItem {
    title: string;
    route: string;
    roles: userRole[];
    icon?: string;
}