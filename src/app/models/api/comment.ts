export interface GetCommentDto{
    commentId: string;
    userId: string;
    userAvatar: string;
    userName: string;
    lastName: string;
    comment: string;
    createDateTime: Date;
}

export interface PostCommentDto{
    content: string;
}