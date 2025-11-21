import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetMessageDto, PostMessageDto } from '../../models/api/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://sumar-mas.dynns.com:9080/campaigns/api/v1/message-campaigns';

  private http = inject(HttpClient);

  /** 
   * Obtiene todas las actualizaciones de campaña asociadas a una campaña específica
   * @param {string} campaignId - ID de la campaña
   * @returns {Observable<@GetMessageDto[]>} - Observable con la lista de actualizaciones de campaña
  */
  getAllMessages(campaignId: string) : Observable<GetMessageDto[]> {
    return this.http.get<GetMessageDto[]>(`${this.apiUrl}/${campaignId}`);
  }

  /** 
   * Crea una nueva actualización de campaña
   * @param {string} campaignId - ID de la campaña a la que se asocia la actualización
   * @param {PostMessageDto} message - Datos de la actualización a crear
   */
  postMessage(campaignId: string, message: PostMessageDto) : Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${campaignId}/send`, message);
  }

  /**
   * Elimina una actualización de campaña
   * @param messageId - ID de la actualización a eliminar
   */
  deleteMessage(messageId: string) : Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}/delete`);
  }
}
