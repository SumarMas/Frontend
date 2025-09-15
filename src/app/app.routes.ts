import { Routes } from '@angular/router';
import { ErrorPageComponent } from './components/error-page-component/error-page-component';

export const routes: Routes = [
    { path: '401', component: ErrorPageComponent, data: { code: 401 } },
    { path: '404', component: ErrorPageComponent, data: { code: 404 } }
];
