import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetCategoryDto } from '../../models/ui/category';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/campaigns/api/v1/categories`;

  http = inject(HttpClient);

  getAllCategories(): Observable<GetCategoryDto[]> {
    return this.http.get<GetCategoryDto[]>(this.apiUrl + '/all');
  }
}
