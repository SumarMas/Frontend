import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetNotificationDto } from '../../models/api/notification';

@Injectable({providedIn: 'root'})
export class NotificationService {
    private apiUrl = 'http://sumar-mas.dynns.com:9080/notifications/api/v1/notifications';

    http = inject(HttpClient);

    getMyNotifications() : Observable<GetNotificationDto[]> {
        return this.http.get<GetNotificationDto[]>(`${this.apiUrl}/my-notifications`);
    }
    
    markAsRead(notificationId: string) {
        return this.http.patch(`${this.apiUrl}/mark-as-read/${notificationId}`, {});
    }
}