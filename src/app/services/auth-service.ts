import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  subject: string; //usuario
  roles: string[];  //roles del usuario
  exp: number; //expiracion
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //busco el token en el localStorage
  private _token = signal<string | null>(localStorage.getItem('token'));

  //se actualiza cuando cambia el token
  readonly isAuthenticated = computed(() => !!this._token());

  //decodifico el token para obtener la informacion del usuario
  readonly payload = computed<JwtPayload | null>(() => {
    const t = this._token();
    return t ? jwtDecode<JwtPayload>(t) : null;
  });

  //obtener los roles y el username
  readonly roles = computed(() => this.payload()?.roles ?? []);
  readonly userName = computed(() => this.payload()?.subject ?? '');

  //guardar token en el ls
  setToken(token: string) {
    this._token.set(token);
    localStorage.setItem('token', token);
  }

  //eliminar token del ls
  logout() {
    this._token.set(null);
    localStorage.removeItem('token');
  }
}
