import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../auth-service';

export const roleGuard: CanActivateFn & CanMatchFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  //roles requeridos para acceder a la ruta
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  //roles del usuario
  const userRoles = authService.roles();

  //si esta autenticado y tiene alguno de los roles requeridos -> puede pasar
  const ok = authService.isAuthenticated() && (!requiredRoles || requiredRoles.some(role => userRoles.includes(role)));
  
  if (!ok) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
