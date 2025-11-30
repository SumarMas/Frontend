import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../api/auth-service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth._token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      const status = err?.status ?? null;

      //detectar si es la petición de login
      const isLoginRequest = req.url.includes('/login');

      if (status === 401) {
        //no navego si es de login
        if (!isLoginRequest) {
          //para otras peticiones
          //auth.clearToken();
          router.navigate(['/401']);
        }
      }

      return throwError(() => err);
    })
  );
};
