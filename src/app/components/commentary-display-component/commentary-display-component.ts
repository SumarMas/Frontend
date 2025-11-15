import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ButtonComponent } from '../button-component/button-component';
import { CommonModule } from '@angular/common';
import { GetCommentDto, PostCommentDto } from '../../models/api/comment';
import { FormsModule } from '@angular/forms';
import { CommentaryComponent } from '../commentary-component/commentary-component';
import { CommentService } from '../../services/api/comment-service';
import { ToastService } from '../../services/ui/toast-service';

@Component({
  selector: 'app-commentary-display-component',
  imports: [ButtonComponent, CommonModule, FormsModule, CommentaryComponent],
  templateUrl: './commentary-display-component.html',
  styleUrl: './commentary-display-component.scss'
})
export class CommentaryDisplayComponent implements OnInit {
  @Input() campaignId: string = '';
  comments: GetCommentDto[] = [];
  newComment: string = '';
  showCommentInput = false;
  isLoading = signal<boolean>(false);

  commentService = inject(CommentService);
  toastService = inject(ToastService);

  ngOnInit(): void {
    this.fetchAllComments();
  }

  toggleCommentInput(): void {
    this.showCommentInput = !this.showCommentInput;
    if (!this.showCommentInput) {
      this.newComment = '';
    }
  }

  fetchAllComments(): void {
    this.commentService.getAllComments(this.campaignId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        switch (error.status) {
          case 500:
            this.toastService.open('Error del servidor, no se ha podido cargar los comentarios. Por favor, inténtalo de nuevo más tarde.', 'error', 3000);
            break;
          default:
            this.toastService.open('No se han podido cargar los comentarios:' + error.message, 'error', 3000);
        }
      }
    });
  }

  submitComment(): void {
    if (this.campaignId != '' && this.newComment.trim() != '') {
      const newComment: PostCommentDto = { content: this.newComment.trim() };

      this.isLoading.set(true);

      this.commentService.postComment(newComment, this.campaignId).subscribe({
        next: () => {
          this.fetchAllComments();
          this.newComment = '';
          this.showCommentInput = false;
          this.toastService.open('Comentario publicado con éxito', 'success', 3000);
        },
        error: (error) => {
          switch (error.status) {
            case 400:
              this.toastService.open('El comentario no puede estar vacío.', 'warning', 3000);
              break;
            case 500:
              this.toastService.open('Error del servidor. Por favor, inténtalo de nuevo más tarde.', 'error', 3000);
              break;
            default:
          }
          this.toastService.open('No se ha podido publicar el comentario:' + error.message, 'error', 3000);
        }
      });
      this.isLoading.set(false);
    }
  }
}
