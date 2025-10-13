export interface GetUserDto {
    userId: string
    firstName: string;
    lastName: string;
    email: string;
    //userName: string;
    profileFileId?: string;
    status?: string;
    roles?: string[];
}   

export interface PutUserDto {
    firstName?: string;
    lastName?: string;
    profileFileId?: string;
}

export interface PostUserDto {
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    password: string;
    //profileFileId?: string;
}