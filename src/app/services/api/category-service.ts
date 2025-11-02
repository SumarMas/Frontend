import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetCategoryDto } from '../../models/ui/category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/campaigns/api/v1/categories';

  http = inject(HttpClient);

  getAllCategories(): Observable<GetCategoryDto[]> {
    return this.http.get<GetCategoryDto[]>(this.apiUrl + '/all');
  }
}
