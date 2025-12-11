import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { GetDonationDto, PostDonationDto } from '../../models/api/donation';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/donations/api/v1/donations';

  private http = inject(HttpClient);

  postDonation(donation: PostDonationDto): Observable<string>{
    return this.http.post<string>(`${this.apiUrl}`, donation, { responseType: 'text' as 'json' }).pipe(map(response => response.trim()));
  }

  getDonationsByUser(): Observable<GetDonationDto[]> {
    return this.http.get<GetDonationDto[]>(`${this.apiUrl}/get-my-donations`);
  }

  getDonationsByCampaign(campaignId: string, status?: 'CONFIRMED' | 'PENDING' | 'REJECTED' | 'PAID'): Observable<GetDonationDto[]> {
    let params: any = { campaign: campaignId };
    if (status) {
      params.status = status;
    }
    return this.http.get<{ donations: { [key: string]: GetDonationDto[] } }>(`${this.apiUrl}`, { params }).pipe(
      map(response => {
        // El backend devuelve { donations: { campaignId: [...] } }
        // Extraemos el array de donaciones
        if (response && response.donations) {
          return Object.values(response.donations).flat();
        }
        return [];
      })
    );
  }
}
