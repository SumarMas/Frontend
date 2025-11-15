import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { GetCommentDto } from '../../models/api/comment';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/api/auth-service';
import { ButtonComponent } from "../button-component/button-component";
import { CommentService } from '../../services/api/comment-service';
import { ToastService } from '../../services/ui/toast-service';
import { ConfirmService } from '../../services/ui/confirm-service';

@Component({
  selector: 'app-commentary-component',
  imports: [DatePipe, ButtonComponent],
  templateUrl: './commentary-component.html',
  styleUrl: './commentary-component.scss'
})
export class CommentaryComponent {
  @Input() comment: GetCommentDto | null = null;
  @Output() commentDeleted = new EventEmitter<void>();

  commentService = inject(CommentService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  confirmService = inject(ConfirmService);

  deleteComment(commentId: string): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.toastService.open('Comentario eliminado con éxito', 'success', 3000);
        this.commentDeleted.emit();
      },
      error: (error) => {
        this.toastService.open('No se ha podido eliminar el comentario:' + error.message, 'error', 3000);
      }
    });
  }

  ask(){
    this.confirmService.ask('¿Estás seguro de que deseas eliminar este comentario?', {
      title: 'Confirmar eliminación',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'warning'
    }).then((confirmed) => {
      if (confirmed && this.comment) {
        this.deleteComment(this.comment.commentId);
      }
    });
  }
}
