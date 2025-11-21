import { Routes } from '@angular/router';
import { ErrorPageComponent } from './components/error-page-component/error-page-component';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';
import { OrganizationRegister } from './pages/organization-register/organization-register';
import { MyOrganizations } from './pages/my-organizations/my-organizations';
import { OrganizationPage } from './pages/organization-page/organization-page';
import { CampaignList } from './pages/campaign-list/campaign-list';
import { CampaignRegister } from './pages/campaign-register/campaign-register';
import { CampaignPage } from './pages/campaign-page/campaign-page';
import { DonationRegister } from './pages/donation-register/donation-register';
import { DonationThanks } from './pages/donation-thanks/donation-thanks';
import { MyDonations } from './pages/my-donations/my-donations';
import { OrganizationList } from './pages/organization-list/organization-list';
import { PendingOrganizationList } from './pages/pending-organization-list/pending-organization-list';
import { TermsAndConditionsPage } from './pages/terms-and-conditions-page/terms-and-conditions-page';
import { MyPayouts } from './pages/my-payouts/my-payouts';
import { PendingPayoutsList } from './pages/pending-payouts-list/pending-payouts-list';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { DashboardOrganization } from './pages/dashboard-organization/dashboard-organization';

export const routes: Routes = [
    { pathMatch: 'full', path: '', redirectTo: 'home' },
    { path: 'home', title: 'Sumar+', component: Home },

    { path: 'login', title: 'Iniciar sesión', component: Login },
    { path: 'register', title: 'Registrarse', component: Register },
    { path: 'profile', title: 'Mi perfil', component: Profile },
    { path: 'terms-and-conditions', title: 'Términos y condiciones', component: TermsAndConditionsPage },
    {
        path: 'organizations', children: [
            { path: 'all', title: 'Explorar organizaciones', component: OrganizationList },
            { path: 'pending', title: 'Organizaciones pendientes', component: PendingOrganizationList },
            { path: 'register', title: 'Registrar organización', component: OrganizationRegister },
            { path: 'my-organizations', title: 'Mis organización', component: MyOrganizations },
            {
                path: ':ngoId', title: 'Organización', children: [
                    { path: '', title: 'Organización', component: OrganizationPage },
                    { path: 'campaign/:campaignId', title: 'Campaña', component: CampaignPage }
                ]
            },
        ]
    },
    {
        path: 'campaigns', children: [
            { path: 'all', title: 'Descubrir campañas', component: CampaignList },
            { path: 'create', title: 'Crear campaña', component: CampaignRegister },
        ]
    },
    {
        path: 'donations', children: [
            { path: 'all', title: 'Mis donaciones', component: MyDonations },
            //{ path: ':donationId', title: 'Donación', component: DonationPage },
            { path: 'new/:campaignName/:campaignId', title: 'Donar', component: DonationRegister },
            { path: 'thanks', title: 'Gracias por tu donación', component: DonationThanks }
        ]
    },
    {
        path: 'payouts', children: [
            { path: 'my-payouts', title: 'Mis solicitudes de pago', component: MyPayouts },
            { path: 'pending-payouts', title: 'Solicitudes de pago pendientes', component: PendingPayoutsList },
        ]
    },
    { path: 'dashboards', children: [
        { path: 'admin', title: 'Panel de administración', component: DashboardAdmin},
        { path: 'organization', title: 'Panel de organización', component: DashboardOrganization},
    ]},


    //paginas de error
    { path: '401', title: 'No autorizado', component: ErrorPageComponent, data: { code: 401 } },
    { path: '403', title: 'Acceso denegado', component: ErrorPageComponent, data: { code: 403 } },
    { path: '404', title: 'No encontrado', component: ErrorPageComponent, data: { code: 404 } },
    { path: '500', title: 'Error del servidor', component: ErrorPageComponent, data: { code: 500 } },

    { path: '**', redirectTo: '404' }
];
