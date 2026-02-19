import { inject, Injectable } from '@angular/core';
import { GetOrganizationDto, PostOrganizationDto, PutOrganizationDto, ValidateOrganizationDto } from '../../models/api/organization';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiBaseUrl}/users/api/v1/ngos`;

  private http = inject(HttpClient);

  register(organizationData: PostOrganizationDto) {
    return this.http.post(this.apiUrl + '/register', organizationData);
  }

  getAllOrganizations(): Observable<GetOrganizationDto[]> {
    return this.http.get<GetOrganizationDto[]>(this.apiUrl + '/all');
  }

  getMyOrganizations() : Observable<GetOrganizationDto> {
    return this.http.get<GetOrganizationDto>(this.apiUrl + '/my-ngo');
  }

  changeStatusOrganization(ngoId: string, data: ValidateOrganizationDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${ngoId}/validate`, data);
  }

  getOrganizationById(ngoId: string): Observable<GetOrganizationDto> {
    return this.http.get<GetOrganizationDto>(`${this.apiUrl}/${ngoId}`);
  }

  getAllOrganizationsApproved(): Observable<GetOrganizationDto[]> {
    return this.http.get<GetOrganizationDto[]>(this.apiUrl + '/all-approved');
  }

  getAllOrganizationsPending(): Observable<GetOrganizationDto[]> {
    return this.http.get<GetOrganizationDto[]>(this.apiUrl + '/pending-approvals');
  }

  updateNgo(ngoId: string,data: PutOrganizationDto): Observable<GetOrganizationDto> {
    return this.http.put<GetOrganizationDto>(this.apiUrl + `/${ngoId}/update`, data);
  }
}
