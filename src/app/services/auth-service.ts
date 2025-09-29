import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, map, mapTo, Observable, tap, throwError } from 'rxjs';

interface JwtPayload {
  subject: string; //usuario
  roles: string[];  //roles del usuario
  exp: number; //expiracion
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '';

  //contiene Camila Lopez, [ 'DONOR', 'ORGANIZATION' ], exp: 9999999999
  private fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiQ2FtaWxhIExvcGV6Iiwicm9sZXMiOlsiRE9OT1IiLCJPUkdBTklaQVRJT04iXSwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor(){
    //reactualizar el token si cambia en otra pestaña
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this._token.set(event.newValue);
      }
    });
  }

  login(email: string, password: string) {
    return this.http.post<{token: string}>(`${this.http}/login`, { email, password }).pipe(
      //guardar el token
      tap(res => this.setToken(res.token)),
      //cambiar el tipo de dato a void, para no exponer el token
      map(() => void 0),
      //si hay error, limpiar el token y mapear el error
      catchError((err: HttpErrorResponse) => {
        this.clearToken();
        return throwError(() => this.mapAuthError(err));
      })
    );
  }

  //metodo para simular login
  fakeLogin() {
    this.setToken(this.fakeToken);
  }

  //busco el token en el localStorage
  private _token = signal<string | null>(localStorage.getItem('token'));

  //se actualiza cuando cambia el token
  readonly isAuthenticated = computed(() => {
    const p = this.payload();
    if (!p) return false;
    if (typeof p.exp !== 'number') return true; //si no tiene expiracion lo dejo pasar, para desarrollo!!!
    const now = Math.floor(Date.now() / 1000);
    return p.exp > now;
  });

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
  clearToken(){
    this._token.set(null);
    localStorage.removeItem('token');
  }

  //eliminar token y redirigir al login
  logout() {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  //mapear errores comunes de autenticacion
  private mapAuthError(err: HttpErrorResponse) {
    if (err.status === 0)   return new Error('No hay conexión con el servidor.');
    if (err.status === 400) return new Error('Datos inválidos. Revisá el formulario.');
    if (err.status === 401) return new Error('Credenciales incorrectas.');
    if (err.status === 403) return new Error('No tenés permisos para acceder.');
    return new Error(err.error?.message || 'Error inesperado. Intentalo de nuevo.');
  }
}
