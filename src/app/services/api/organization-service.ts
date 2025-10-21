import { inject, Injectable } from '@angular/core';
import { GetOrganizationDto, PostOrganizationDto, ValidateOrganizationDto } from '../../models/api/organization';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/users/api/v1/ngos';

  private http = inject(HttpClient);

  register(organizationData: PostOrganizationDto) {
    return this.http.post(this.apiUrl + '/register', organizationData);
  }

  getMyOrganizations() : Observable<GetOrganizationDto[]> {
    return this.http.get<GetOrganizationDto[]>(this.apiUrl + '/my-ngo');
  }

  approveOrganization(ngoId: string, data: ValidateOrganizationDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${ngoId}/validate`, data);
  }
}
