export interface GetUserDto {
    id: string
    name: string;
    lastname: string;
    email: string;
    username: string;
}

export interface PostUserDto {
    name: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
}