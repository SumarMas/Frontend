import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostUserDto } from '../../models/api/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'https://api.example.com/api/v1/users';

  private http = inject(HttpClient);

  register(user: PostUserDto): Observable<any> {
    return this.http.post(this.url + '/register' , user);
  }
}
