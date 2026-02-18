import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, delay, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { GetUserDto } from '../../models/api/user';

interface JwtPayload {
  user_id?: string; //usuario
  roles?: string[] | string;  //roles del usuario
  exp?: number; //expiracion
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/auth/api/v1/auth';
  private userUrl = 'http://sumar-mas.dynns.com:9080/users/api/v1/users';

  //contiene Camila Lopez, [ 'DONOR', 'ORGANIZATION' ], exp: 9999999999
  private fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiQ2FtaWxhIExvcGV6Iiwicm9sZXMiOlsiRE9OT1IiLCJPUkdBTklaQVRJT04iXSwiZXhwIjo5OTk5OTk5OTk5fQ.signature';

  private http = inject(HttpClient);
  private router = inject(Router);

  //busco el token en el localStorage
  _token = signal<string | null>(localStorage.getItem('token'));
  _userName = signal<string | null>(localStorage.getItem('user_name'));

  // Roles adicionales que se agregan en tiempo de ejecución (ej: tras registrar una organización)
  private _extraRoles = signal<string[]>(
    JSON.parse(localStorage.getItem('extra_roles') ?? '[]')
  );

  private _tokenExpTs = signal<number | null>(
    localStorage.getItem('token_exp_ts') ? Number(localStorage.getItem('token_exp_ts')) : null
  );

  constructor() {
    //reactualizar el token si cambia en otra pestaña
    window.addEventListener('storage', (event) => {
      if (event.key === 'token') {
        this._token.set(event.newValue);
      }
    });

    // Recuperar el nombre del usuario si hay token pero no hay nombre
    effect(() => {
      const userId = this.userId();
      const userName = this._userName();
      
      // Si hay token válido pero no hay nombre, cargar el perfil
      if (userId && !userName) {
        this.http.get<GetUserDto>(`${this.userUrl}/my-profile`).subscribe({
          next: (user) => {
            const fullName = user.firstName + ' ' + user.lastName;
            this._userName.set(fullName);
            localStorage.setItem('user_name', fullName);
          },
          error: (err) => {
            console.error('Error al recuperar nombre de usuario:', err);
          }
        });
      }
    });
  }

  parseRoles(value: unknown): string[] {
    if (!value) return [];

    if (typeof value === 'string') {
      return value
        .replace(/[\[\]]/g, '')
        .split(',')            //separa por coma
        .map(r => r.trim())    //quita espacios
        .filter(Boolean);      //elimina vacíos
    }

    if (Array.isArray(value)) return value.map(String);

    return [String(value)];
  }


  login(userName: string, password: string) {
    return this.http.post<{ token: string; expiresIn?: number }>(`${this.apiUrl}/login`, { userName, password }).pipe(
      tap(res => this.setToken(res.token, res.expiresIn)),
      // Encadenar la carga del perfil del usuario
      switchMap(() => this.http.get<GetUserDto>(`${this.userUrl}/my-profile`)),
      tap((user: GetUserDto) => {
        const fullName = user.firstName + ' ' + user.lastName;
        this._userName.set(fullName);
        localStorage.setItem('user_name', fullName);
      }),
      map(() => void 0),
      catchError((err: HttpErrorResponse) => {
        this.clearToken();
        return throwError(() => this.mapAuthError(err));
      })
    );
  }


  //metodo para simular login
  fakeLogin(): Observable<void> {
    this.setToken(this.fakeToken);
    return of(void 0).pipe(delay(2000)); //simular retardo de red
  }


  //se actualiza cuando cambia el token
  readonly isAuthenticated = computed(() => {
    const p = this.payload();
    if (p?.exp && typeof p.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      return p.exp > now;
    }

    const expTs = this._tokenExpTs();
    if (expTs && typeof expTs === 'number') {
      return Date.now() < expTs;
    }

    return false;
  });

  //decodifico el token para obtener la informacion del usuario
  readonly payload = computed<JwtPayload | null>(() => {
    const t = this._token();
    if (!t) return null;
    try {
      return jwtDecode<JwtPayload>(t);
    } catch (e) {
      console.error('Token inválido:', e);
      return null;
    }
  });


  //obtener los roles y el userId (fusiona roles del token + roles extra locales)
  readonly roles = computed(() => {
    const tokenRoles = this.parseRoles(this.payload()?.roles ?? []);
    const extra = this._extraRoles();
    // Unir sin duplicados
    return [...new Set([...tokenRoles, ...extra])];
  });
  readonly userId = computed(() => this.payload()?.user_id ?? '');

  setToken(token: string, expiresInSeconds?: number) {
    this._token.set(token);
    localStorage.setItem('token', token);

    if (typeof expiresInSeconds === 'number') {
      const expTs = Date.now() + expiresInSeconds * 1000;
      this._tokenExpTs.set(expTs);
      localStorage.setItem('token_exp_ts', String(expTs));
    } else {
      // si no llega expiresIn, borramos token_exp_ts para que la comprobación use payload.exp si existe
      this._tokenExpTs.set(null);
      localStorage.removeItem('token_exp_ts');
    }
  }


  clearToken() {
    this._token.set(null);
    this._tokenExpTs.set(null);
    this._userName.set(null);
    this._extraRoles.set([]);
    localStorage.removeItem('token');
    localStorage.removeItem('token_exp_ts');
    localStorage.removeItem('user_name');
    localStorage.removeItem('extra_roles');
  }


  //eliminar token y redirigir al login
  logout() {
    this.clearToken();
    this.router.navigate(['/login']);
  }


  //mapear errores comunes de autenticacion
  private mapAuthError(err: HttpErrorResponse) {
    if (err.status === 0) return new Error('No hay conexión con el servidor.');
    if (err.status === 400) return new Error('Datos inválidos. Revisá el formulario.');
    if (err.status === 401) return new Error('Credenciales incorrectas.');
    if (err.status === 403) return new Error('No tenés permisos para acceder.');
    return new Error(err.error?.message || 'Error inesperado. Intentalo de nuevo.');
  }

  pushNgoRole() {
    const currentRoles = this.roles();
    if (!currentRoles.includes('ORGANIZATION')) {
      const updated = [...this._extraRoles(), 'ORGANIZATION'];
      this._extraRoles.set(updated);
      localStorage.setItem('extra_roles', JSON.stringify(updated));
    }
  }
}
