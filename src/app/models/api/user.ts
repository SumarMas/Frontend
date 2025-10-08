export interface GetUserDto {
    id: string
    firstName: string;
    lastName: string;
    email: string;
    username: string;
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
    username: string;
    password: string;
    profileFileId?: string;
}