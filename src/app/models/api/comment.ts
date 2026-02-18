export interface GetCommentDto{
    comment_id: string;
    user_id: string;
    comment: string;
    content?: string; // Backend format fallback
    create_date_time?: Date | string; // Backend format fallback
}

export interface PostCommentDto{
    content: string;
}