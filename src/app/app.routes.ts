import { Routes } from '@angular/router';
import { ErrorPageComponent } from './components/error-page-component/error-page-component';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
    { pathMatch: 'full', path: '', redirectTo: 'home' },
    { path: 'home', title: 'Sumar+', component: Home },

    { path: 'login', title: 'Iniciar sesión', component: Login },
    // { path: 'register' },
    // { path: 'campaigns' },
    // { path: 'organizations' },
    // { path: 'donations' },
    // { path: 'dashboards' },


    //paginas de error
    { path: '401', title: 'No autorizado', component: ErrorPageComponent, data: { code: 401 } },
    { path: '403', title: 'Acceso denegado', component: ErrorPageComponent, data: { code: 403 } },
    { path: '404', title: 'No encontrado', component: ErrorPageComponent, data: { code: 404 } },
    { path: '500', title: 'Error del servidor', component: ErrorPageComponent, data: { code: 500 } }
];
