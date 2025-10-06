export interface GetUserDto {
    id: string
    name: string;
    lastname: string;
    email: string;
    username: string;
}

export interface PutUserDto {
    name?: string;
    lastname?: string;
    profileFileId?: string;
}

export interface PostUserDto {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
    profileFileId?: string;
}