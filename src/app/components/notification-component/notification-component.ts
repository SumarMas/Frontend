import { Component, signal } from '@angular/core';
import { ButtonComponent } from "../button-component/button-component";
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon-component/icon-component';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean; // Esta propiedad viene del backend
  timestamp: Date;
  actionUrl?: string;
}

@Component({
  selector: 'app-notification-component',
  imports: [ButtonComponent, CommonModule, IconComponent],
  templateUrl: './notification-component.html',
  styleUrl: './notification-component.scss'
})
export class NotificationComponent {
  isOpen = signal<boolean>(false);
  notifications = signal<Notification[]>([
    // TODO: Reemplazar con llamada al servicio del backend
    // Estos son datos de ejemplo para desarrollo
    {
      id: '1',
      title: 'Nueva donación recibida',
      message: 'Has recibido una donación de $500 para la campaña "Ayuda Alimentaria"',
      type: 'success',
      read: false, // Viene del backend
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutos atrás
      actionUrl: '/campaigns/123'
    },
    {
      id: '2',
      title: 'Campaña aprobada',
      message: 'Tu campaña "Educación para Todos" ha sido aprobada y está activa',
      type: 'info',
      read: false, // Viene del backend
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      actionUrl: '/campaigns/456'
    },
    {
      id: '3',
      title: 'Documento pendiente',
      message: 'Necesitas actualizar tus documentos de verificación',
      type: 'warning',
      read: true, // Viene del backend
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
      actionUrl: '/profile/documents'
    },
    {
      id: '4',
      title: 'Meta alcanzada',
      message: '¡Felicitaciones! Tu campaña alcanzó el 100% de su meta',
      type: 'success',
      read: true, // Viene del backend
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
      actionUrl: '/campaigns/789'
    }
  ]);

  unreadCount = signal<number>(this.notifications().filter(n => !n.read).length);

  toggleDropdown() {
    this.isOpen.set(!this.isOpen());
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  markAsRead(notificationId: string) {
    // Verificar si ya está leída para evitar llamadas innecesarias
    const notification = this.notifications().find(n => n.id === notificationId);
    if (notification?.read) return;
    
    // TODO: Hacer llamada al backend para marcar como leída
    // Ejemplo: this.notificationService.markAsRead(notificationId).subscribe(...)
    
    const updatedNotifications = this.notifications().map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.set(updatedNotifications);
    this.updateUnreadCount();
  }

  markAllAsRead() {
    // TODO: Hacer llamada al backend para marcar todas como leídas
    // Ejemplo: this.notificationService.markAllAsRead().subscribe(...)
    
    const updatedNotifications = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updatedNotifications);
    this.updateUnreadCount();
  }

  deleteNotification(notificationId: string, event: Event) {
    event.stopPropagation();
    
    // TODO: Hacer llamada al backend para eliminar la notificación
    // Ejemplo: this.notificationService.deleteNotification(notificationId).subscribe(...)
    
    const updatedNotifications = this.notifications().filter(n => n.id !== notificationId);
    this.notifications.set(updatedNotifications);
    this.updateUnreadCount();
  }

  clearAll() {
    // TODO: Hacer llamada al backend para eliminar todas las notificaciones
    // Ejemplo: this.notificationService.clearAll().subscribe(...)
    
    this.notifications.set([]);
    this.unreadCount.set(0);
  }

  private updateUnreadCount() {
    this.unreadCount.set(this.notifications().filter(n => !n.read).length);
  }

  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'check';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': 
      default: return 'info';
    }
  }

  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': 
      default: return 'text-blue-600 bg-blue-50';
    }
  }

  getTimeAgo(date: Date): string {
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

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getTodayOrUnreadNotifications(): Notification[] {
    return this.notifications().filter(n => this.isToday(n.timestamp) || !n.read);
  }

  getOlderNotifications(): Notification[] {
    return this.notifications().filter(n => !this.isToday(n.timestamp) && n.read);
  }

  handleNotificationClick(notification: Notification) {
    // Ya no necesita marcar como leída aquí, ya se marcó al abrir
    if (notification.actionUrl) {
      // TODO: Implementar navegación con Router cuando esté disponible
      // Ejemplo: this.router.navigate([notification.actionUrl]);
      console.log('Navigate to:', notification.actionUrl);
    }
  }

  handleNotificationHover(notification: Notification) {
    // Marcar como leída al hacer hover si aún no lo está
    if (!notification.read) {
      this.markAsRead(notification.id);
    }
  }

  // TODO: Agregar método para cargar notificaciones desde el backend
  // loadNotifications() {
  //   this.notificationService.getUserNotifications().subscribe({
  //     next: (notifications) => {
  //       this.notifications.set(notifications);
  //       this.updateUnreadCount();
  //     },
  //     error: (error) => console.error('Error loading notifications:', error)
  //   });
  // }
}
