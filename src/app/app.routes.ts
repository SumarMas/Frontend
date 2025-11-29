import { Routes } from '@angular/router';
import { ErrorPageComponent } from './components/error-page-component/error-page-component';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { OrganizationPage } from './pages/organization-page/organization-page';
import { CampaignList } from './pages/campaign-list/campaign-list';
import { CampaignPage } from './pages/campaign-page/campaign-page';
import { OrganizationList } from './pages/organization-list/organization-list';
import { authGuard } from './services/guards/auth-guard';
import { roleGuard } from './services/guards/role-guard';

export const routes: Routes = [
    { pathMatch: 'full', path: '', redirectTo: 'home' },
    { path: 'home', title: 'Sumar+', component: Home },

    {
        path: 'login',
        title: 'Iniciar sesión',
        component: Login
    },
    {
        path: 'register',
        title: 'Registrarse',
        loadComponent: () => import('./pages/register/register').then(m => m.Register)
    },
    {
        path: 'profile',
        title: 'Mi perfil',
        loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
        canActivate: [authGuard]
    },
    {
        path: 'terms-and-conditions',
        title: 'Términos y condiciones',
        loadComponent: () => import('./pages/terms-and-conditions-page/terms-and-conditions-page').then(m => m.TermsAndConditionsPage)
    },

    //=========================================organizations==========================================
    {
        path: 'organizations', children: [
            { path: 'all', title: 'Explorar organizaciones', component: OrganizationList },
            {
                path: 'pending',
                title: 'Organizaciones pendientes',
                loadComponent: () => import('./pages/pending-organization-list/pending-organization-list').then(m => m.PendingOrganizationList),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ADMIN'] }

            },
            {
                path: 'register', title: 'Registrar organización',
                loadComponent: () => import('./pages/organization-register/organization-register').then(m => m.OrganizationRegister),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['DONOR'] }

            },
            {
                path: 'my-organizations', title: 'Mis organización', 
                loadComponent: () => import('./pages/my-organizations/my-organizations').then(m => m.MyOrganizations),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['DONOR','ORGANIZATION'] }
            },
            {
                path: ':ngoId', title: 'Organización', children: [
                    { path: '', title: 'Organización', component: OrganizationPage },
                    { path: 'campaign/:campaignId', title: 'Campaña', component: CampaignPage }
                ]
            },
        ]
    },
    //=========================================campaigns==========================================
    {
        path: 'campaigns', children: [
            { path: 'all', title: 'Descubrir campañas', component: CampaignList },
            {
                path: 'create', title: 'Crear campaña',
                loadComponent: () => import('./pages/campaign-register/campaign-register').then(m => m.CampaignRegister),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ORGANIZATION'] }
            },
        ]
    },
    //=========================================donations==========================================
    {
        path: 'donations', children: [
            {
                path: 'all',
                title: 'Mis donaciones',
                loadComponent: () => import('./pages/my-donations/my-donations').then(m => m.MyDonations),
                canActivate: [authGuard]
            },
            //{ path: ':donationId', title: 'Donación', component: DonationPage },
            {
                path: 'new/:campaignName/:campaignId',
                title: 'Donar',
                loadComponent: () => import('./pages/donation-register/donation-register').then(m => m.DonationRegister),
                canActivate: [authGuard]
            },
            {
                path: 'thanks',
                title: 'Gracias por tu donación',
                loadComponent: () => import('./pages/donation-thanks/donation-thanks').then(m => m.DonationThanks),
                canActivate: [authGuard]
            }
        ]
    },
    //=========================================payouts==========================================
    {
        path: 'payouts', children: [
            {
                path: 'my-payouts',
                title: 'Mis solicitudes de pago',
                loadComponent: () => import('./pages/my-payouts/my-payouts').then(m => m.MyPayouts),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ORGANIZATION'] }

            },
            {
                path: 'pending-payouts',
                title: 'Solicitudes de pago pendientes',
                loadComponent: () => import('./pages/pending-payouts-list/pending-payouts-list').then(m => m.PendingPayoutsList),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ADMIN'] }
            },
        ]
    },
    //=========================================dashboards==========================================
    {
        path: 'dashboards', children: [
            {
                path: 'admin',
                title: 'Panel de administración',
                loadComponent: () => import('./pages/dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'organization',
                title: 'Panel de organización',
                loadComponent: () => import('./pages/dashboard-organization/dashboard-organization').then(m => m.DashboardOrganization),
                canActivate: [authGuard, roleGuard],
                data: { roles: ['ORGANIZATION'] }
            },
        ]
    },
    //=========================================error pages==========================================
    {
        path: '401',
        title: 'No autorizado',
        component: ErrorPageComponent,
        data: { code: 401 }
    },
    {
        path: '403',
        title: 'Acceso denegado',
        component: ErrorPageComponent,
        data: { code: 403 }
    },
    {
        path: '404',
        title: 'No encontrado',
        component: ErrorPageComponent,
        data: { code: 404 }
    },
    {
        path: '500',
        title: 'Error del servidor',
        component: ErrorPageComponent,
        data: { code: 500 }
    },

    { path: '**', redirectTo: '404' }
];
