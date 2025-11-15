import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostUserDto, GetUserDto, PutUserDto } from '../../models/api/user';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/users/api/v1/users';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  register(userData: PostUserDto) {
    return this.http.post<{ token: string; expiresIn?: number }>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.authService.setToken(res.token, res.expiresIn)),
      map(() => void 0)
    );
  }

  getById(): Observable<GetUserDto> {
    return this.http.get<GetUserDto>(this.apiUrl + '/my-profile');
  }

  updateUser(userData: PutUserDto, userId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${userId}/update`, userData);
  }
}
