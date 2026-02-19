import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetCommentDto, PostCommentDto } from '../../models/api/comment';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
    private apiUrl = `${environment.apiBaseUrl}/campaigns/api/v1/comments`;

  http = inject(HttpClient);

  postComment(comment: PostCommentDto, campaignId: string) : Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${campaignId}/add`, comment);
  }

  getAllComments(campaignId: string) : Observable<GetCommentDto[]> {
    return this.http.get<GetCommentDto[]>(`${this.apiUrl}/${campaignId}`);
  }

  deleteComment(commentId: string) : Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}/delete`);
  }
}
