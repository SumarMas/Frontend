import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/media/api/v1/media';

  http = inject(HttpClient);

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ uuid: string }>(`${this.apiUrl}/savefile`, formData)
    .pipe(
      map(response => response.uuid)
    );
  }

  getFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/getFile/${fileId}`, { 
      responseType: 'blob' 
    });
  }
}
