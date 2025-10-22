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

export const routes: Routes = [
    { pathMatch: 'full', path: '', redirectTo: 'home' },
    { path: 'home', title: 'Sumar+', component: Home },

    { path: 'login', title: 'Iniciar sesión', component: Login },
    { path: 'register', title: 'Registrarse', component: Register },
    { path: 'profile', title: 'Mi perfil', component: Profile },
    { path: 'organizations', children:[
        { path: 'register', title: 'Registrar organización', component: OrganizationRegister},
        { path: 'my-organizations', title: 'Mis organizaciones', component: MyOrganizations},
        { path: ':ngoId', title: 'Organización', component: OrganizationPage},
    ]},
    { path: 'campaigns', children:[
        { path: 'all', title: 'Descubrir campañas', component: CampaignList },
        { path: 'create', title: 'Crear campaña', component: Home },
    ] },
    // { path: 'donations' },
    // { path: 'dashboards' },


    //paginas de error
    { path: '401', title: 'No autorizado', component: ErrorPageComponent, data: { code: 401 } },
    { path: '403', title: 'Acceso denegado', component: ErrorPageComponent, data: { code: 403 } },
    { path: '404', title: 'No encontrado', component: ErrorPageComponent, data: { code: 404 } },
    { path: '500', title: 'Error del servidor', component: ErrorPageComponent, data: { code: 500 } },

    { path: '**', redirectTo: '404' }
];
