import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon-component/icon-component';
import { NotificationService } from '../../services/api/notification-service';
import { GetNotificationDto, NotificationType } from '../../models/api/notification';
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-notification-component',
  imports: [ButtonComponent, CommonModule, IconComponent],
  templateUrl: './notification-component.html',
  styleUrl: './notification-component.scss'
})
export class NotificationComponent implements OnInit {
  isOpen = signal<boolean>(false);
  notifications = signal<GetNotificationDto[]>([]);
  unreadCount = signal<number>(0);
  isLoading = signal<boolean>(false);

  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.loadNotifications();


  }

  loadNotifications() {
    this.isLoading.set(true);
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.updateUnreadCount();
        this.isLoading.set(false);
        console.log(this.notifications());
      },
      error: (error) => {
        console.error('Error al cargar notificaciones:', error);
        this.isLoading.set(false);
      }
    });
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications().find(n => n.notification_id === notificationId);
    if (notification?.read) return;

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const updatedNotifications = this.notifications().map(n =>
          n.notification_id === notificationId ? { ...n, read: true } : n
        );
        this.notifications.set(updatedNotifications);
        this.updateUnreadCount();
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
        this.toastService.open('Error al actualizar notificación', 'error', 3000);
      }
    });
  }

  markAllAsRead() {
    const unreadIds = this.notifications().filter(n => !n.read).map(n => n.notification_id);

    if (unreadIds.length === 0) return;

    // Marcar todas en paralelo
    Promise.all(
      unreadIds.map(id => this.notificationService.markAsRead(id).toPromise())
    ).then(() => {
      const updatedNotifications = this.notifications().map(n => ({ ...n, read: true }));
      this.notifications.set(updatedNotifications);
      this.updateUnreadCount();
    }).catch(error => {
      console.error('Error al marcar todas como leídas:', error);
      this.toastService.open('Error al actualizar notificaciones', 'error', 3000);
    });
  }

  deleteNotification(notificationId: string, event: Event) {
    event.stopPropagation();

    // Por ahora solo eliminar del frontend, el backend no tiene endpoint de delete
    const updatedNotifications = this.notifications().filter(n => n.notification_id !== notificationId);
    this.notifications.set(updatedNotifications);
    this.updateUnreadCount();
  }

  clearAll() {
    // Por ahora solo limpiar del frontend
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  private updateUnreadCount() {
    this.unreadCount.set(this.notifications().filter(n => !n.read).length);
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.USER_CREATED:
        return 'person';
      case NotificationType.NGO_DOCUMENTS_RECEIVED:
        return 'description';
      case NotificationType.NGO_DOCUMENTS_APPROVED:
        return 'check';
      case NotificationType.NGO_DOCUMENTS_REJECTED:
        return 'close';
      case NotificationType.DONATION_SUCCESS:
        return 'volunteer-activism';
      case NotificationType.CAMPAIGN_FINALIZED:
        return 'diversity-1';
      case NotificationType.NGO_PUBLISHED_MESSAGE:
        return 'chat';
      case NotificationType.PAYOUT_REQUESTED:
        return 'search-insights';
      case NotificationType.PAYOUT_APPROVED:
        return 'check';
      default:
        return 'info';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.USER_CREATED:
        return 'text-blue-600 bg-blue-50';
      case NotificationType.NGO_DOCUMENTS_RECEIVED:
        return 'text-purple-600 bg-purple-50';
      case NotificationType.NGO_DOCUMENTS_APPROVED:
        return 'text-green-600 bg-green-50';
      case NotificationType.NGO_DOCUMENTS_REJECTED:
        return 'text-red-600 bg-red-50';
      case NotificationType.DONATION_SUCCESS:
        return 'text-violet-600 bg-violet-50';
      case NotificationType.CAMPAIGN_FINALIZED:
        return 'text-pink-600 bg-pink-50';
      case NotificationType.NGO_PUBLISHED_MESSAGE:
        return 'text-indigo-600 bg-indigo-50';
      case NotificationType.PAYOUT_REQUESTED:
        return 'text-orange-600 bg-orange-50';
      case NotificationType.PAYOUT_APPROVED:
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  getTodayOrUnreadNotifications(): GetNotificationDto[] {
    return this.notifications().filter(n => this.isToday(n.createdAt) || !n.read);
  }

  getOlderNotifications(): GetNotificationDto[] {
    return this.notifications().filter(n => !this.isToday(n.createdAt) && n.read);
  }

  handleNotificationClick(notification: GetNotificationDto) {
    // Marcar como leída al hacer click
    if (!notification.read) {
      this.markAsRead(notification.notification_id);
    }
  }

  handleNotificationHover(notification: GetNotificationDto) {
    // Marcar como leída al hacer hover si aún no lo está
    if (!notification.read) {
      this.markAsRead(notification.notification_id);
    }
  }
}
