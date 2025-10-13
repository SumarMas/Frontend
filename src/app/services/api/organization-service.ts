import { inject, Injectable } from '@angular/core';
import { PostOrganizationDto } from '../../models/api/organization';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/users/api/v1/ngos';

  private http = inject(HttpClient);

  register(organizationData: PostOrganizationDto) {
    return this.http.post(this.apiUrl + '/register', organizationData);
  }
}
