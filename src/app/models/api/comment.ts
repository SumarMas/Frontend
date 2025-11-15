export interface GetCommentDto{
    commentId: string;
    userId: string;
    userAvatar: string;
    userName: string;
    lastName: string;
    comment: string;
    content?: string; // Backend format fallback
    createDateTime: Date;
    create_date_time?: Date | string; // Backend format fallback
}

export interface PostCommentDto{
    content: string;
}