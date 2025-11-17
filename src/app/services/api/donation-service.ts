import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PostDonationDto } from '../../models/api/donation';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/donations/api/v1/donations';

  private http = inject(HttpClient);

  postDonation(donation: PostDonationDto): Observable<string>{
    return this.http.post<string>(`${this.apiUrl}`, donation, { responseType: 'text' as 'json' }).pipe(map(response => response.trim()));
  }

  getDonationsByUser(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/get-my-donations`);
  }
}
