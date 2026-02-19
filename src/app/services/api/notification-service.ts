import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetNotificationDto } from '../../models/api/notification';
import { environment } from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class NotificationService {
    private apiUrl = `${environment.apiBaseUrl}/notifications/api/v1/notifications`;

    http = inject(HttpClient);

    getMyNotifications() : Observable<GetNotificationDto[]> {
        return this.http.get<GetNotificationDto[]>(`${this.apiUrl}/my-notifications`);
    }
    
    markAsRead(notificationId: string) {
        return this.http.patch(`${this.apiUrl}/mark-as-read/${notificationId}`, {});
    }
}