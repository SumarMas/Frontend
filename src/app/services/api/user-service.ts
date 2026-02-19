import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostUserDto, GetUserDto, PutUserDto } from '../../models/api/user';
import { catchError, delay, map, Observable, of, switchMap, tap } from 'rxjs';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users/api/v1/users`;

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  register(userData: PostUserDto) {
    return this.http.post<{ token: string; expiresIn?: number }>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.authService.setToken(res.token, res.expiresIn)),
      // Encadenar la carga del perfil del usuario
      switchMap(() => this.getById()),
      tap((user: GetUserDto) => {
        const fullName = user.firstName + ' ' + user.lastName;
        this.authService._userName.set(fullName);
        localStorage.setItem('user_name', fullName);
      }),
      map(() => void 0)
    );
  }

  getById(): Observable<GetUserDto> {
    return this.http.get<GetUserDto>(this.apiUrl + '/my-profile');
  }

  getUserById(userId: string): Observable<GetUserDto> {
    return this.http.get<GetUserDto>(`${this.apiUrl}/${userId}/profile`);
  }

  updateUser(userData: PutUserDto, userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/update`, userData);
  }
}
