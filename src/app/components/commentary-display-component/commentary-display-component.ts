import { Component, inject, Input, OnInit } from '@angular/core';
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
  comments: GetCommentDto[] = [{ commentId: '', userId: '', userAvatar: '', userName: 'Daniel', lastName: 'Rodriguez', comment: 'Este es un comentario de prueba.', createDateTime: new Date('2025-10-27 18:00:00') }];
  newComment: string = '';
  showCommentInput = false;

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
        this.toastService.open('No se han podido cargar los comentarios:' + error.message, 'error', 3000);
      }
    });
  }

  submitComment(): void {
    if (this.campaignId != '' && this.newComment.trim() != '') {
      const newComment: PostCommentDto = { content: this.newComment.trim() };

      this.commentService.postComment(newComment, this.campaignId).subscribe({
        next: () => {
          this.fetchAllComments();
          this.newComment = '';
          this.showCommentInput = false;
          this.toastService.open('Comentario publicado con éxito', 'success', 3000);
        },
        error: (error) => {
          this.toastService.open('No se ha podido publicar el comentario:' + error.message, 'error', 3000);
        }
      });
    }
  }
}
