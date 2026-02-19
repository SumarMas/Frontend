import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetCampaignDto, PostCampaignDto, PutCampaignDto } from '../../models/api/campaign';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiBaseUrl}/campaigns/api/v1/campaigns`;

  http = inject(HttpClient);

  createCampaign(campaignData: PostCampaignDto): Observable<GetCampaignDto> {
    console.log(JSON.stringify(campaignData));
    
    return this.http.post<GetCampaignDto>(`${this.apiUrl}/create`, campaignData);
  }

  filter(state?: "ACTIVE" | "CLOSED", categories?: string[], tags?: string[], ngoId?: string): Observable<GetCampaignDto[]> {
    const params: any = {};
    if (state) params.state = state;
    if (categories) params.categories = categories.join(',');
    if (tags) params.tags = tags.join(',');
    if (ngoId) params.ngoId = ngoId;

    return this.http.get<GetCampaignDto[]>(`${this.apiUrl}/filter`, { params });
  }

  getCampaignById(campaignId: string): Observable<GetCampaignDto> {
    return this.http.get<GetCampaignDto>(`${this.apiUrl}/${campaignId}`);
  }

  updateCampaign(campaignId: string, campaignData: PutCampaignDto): Observable<GetCampaignDto> {
    return this.http.put<GetCampaignDto>(`${this.apiUrl}/${campaignId}/update`, campaignData);
  }
}