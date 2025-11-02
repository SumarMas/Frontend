import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/campaigns/api/v1/campaigns';

  http = inject(HttpClient);

  createCampaign(campaignData: any) {
    return this.http.post<void>(`${this.apiUrl}/create`, campaignData);
  }
}
