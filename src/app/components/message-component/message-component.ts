import { Component, inject, Input } from '@angular/core';
import { GetMessageDto } from '../../models/api/message';
import { DatePipe } from '@angular/common';
import { ButtonComponent } from "../button-component/button-component";
import { MessageService } from '../../services/api/message-service';
import { ConfirmService } from '../../services/ui/confirm-service';
import { ToastService } from '../../services/ui/toast-service';
import { AuthService } from '../../services/api/auth-service';

@Component({
  selector: 'app-message-component',
  imports: [DatePipe, ButtonComponent],
  templateUrl: './message-component.html',
  styleUrl: './message-component.scss'
})
export class MessageComponent {
  @Input() message: GetMessageDto | null = {
    messageCampaignId: '',
    title: 'Test',
    description: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    creationDateTime: new Date(),
  };

  authService = inject(AuthService);
  messageService = inject(MessageService);
  confirmService = inject(ConfirmService);
  toastService = inject(ToastService);

  deleteUpdate(messageCampaignId: string): void {
    this.messageService.deleteMessage(messageCampaignId).subscribe({
      next: () => {
        this.toastService.open('Actualización eliminada correctamente', 'success', 3000);
      },
      error: () => {
        this.toastService.open('Error al eliminar la actualización', 'error', 3000);
      }
    });
  }

  ask(){
    this.confirmService.ask('¿Estás seguro de que deseas eliminar esta actualización?', {
      title: 'Confirmar eliminación',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'warning'
    }).then((confirmed) => {
      if (confirmed && this.message) {
        this.deleteUpdate(this.message.messageCampaignId);
      }
    });
  }
}
