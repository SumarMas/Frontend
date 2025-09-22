import { Routes } from '@angular/router';
import { ErrorPageComponent } from './components/error-page-component/error-page-component';
import { Home } from './pages/home/home';

export const routes: Routes = [
    { pathMatch: 'full', path: '', redirectTo: 'home' },
    { path: 'home', component: Home },
    
    // { path: 'login' },
    // { path: 'register' },
    // { path: 'campaigns' },
    // { path: 'organizations' },
    // { path: 'donations' },
    // { path: 'dashboards' },


    //paginas de error
    { path: '401', component: ErrorPageComponent, data: { code: 401 } },
    { path: '404', component: ErrorPageComponent, data: { code: 404 } }
];
