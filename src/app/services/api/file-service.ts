import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileBase64 {
    uuid:      string;
    sha256:    string;
    fileName:  string;
    mimeType:  string;
    extension: string;
    bytes:     null;
    base64:    string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = `${environment.apiBaseUrl}/media/api/v1/media`;

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

  getFileBase64(fileId: string): Observable<FileBase64> {
    return this.http.get<FileBase64>(`${this.apiUrl}/getFileBase64/${fileId}`);
  }
}
