import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostUserDto, GetUserDto } from '../../models/api/user';
import { delay, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'https://api.example.com/api/v1/users';

  private http = inject(HttpClient);

  register(user: PostUserDto): Observable<any> {
    return this.http.post(this.url + '/register' , user);
  }

  getById(id: string): Observable<any> {
    return this.http.get(this.url + '/' + id);
  }

  fakeGetById(){
    const fakeUser: GetUserDto = {
      id: '1234',
      firstName: 'Pablo Alberto',
      lastName: 'Diaz',
      email: 'pabloo.alb@gmail.com',
      username: 'pabloo.alb'
    };
    return of(fakeUser).pipe(delay(3000));
  }
}
