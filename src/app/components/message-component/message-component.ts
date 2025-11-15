import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { GetMessageDto } from '../../models/api/message';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonComponent } from "../button-component/button-component";
import { MessageService } from '../../services/api/message-service';
import { ConfirmService } from '../../services/ui/confirm-service';
import { ToastService } from '../../services/ui/toast-service';
import { AuthService } from '../../services/api/auth-service';
import { FileService } from '../../services/api/file-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-message-component',
  imports: [DatePipe, ButtonComponent, CommonModule],
  templateUrl: './message-component.html',
  styleUrl: './message-component.scss'
})
export class MessageComponent implements OnInit {
  @Input() message: GetMessageDto | null = null;

  authService = inject(AuthService);
  messageService = inject(MessageService);
  confirmService = inject(ConfirmService);
  toastService = inject(ToastService);
  fileService = inject(FileService);
  sanitizer = inject(DomSanitizer);

  messageImageUrl = signal<SafeUrl | null>(null);

  ngOnInit(): void {
    if (this.message?.fileId) {
      this.loadMessageImage(this.message.fileId);
    }
  }

  loadMessageImage(fileId: string): void {
    this.fileService.getFile(fileId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.messageImageUrl.set(safeUrl);
      },
      error: (err) => {
        console.error('Error al cargar imagen del mensaje:', err);
      }
    });
  }

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
