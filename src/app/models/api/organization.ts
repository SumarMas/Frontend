import { GetUserDto } from "./user";

export interface GetOrganizationDto {
    ngoId: string;
    userCreator: GetUserDto;
    name: string;
    description: string;
    profileFileId?: string;
    bannerFileId?: string;
    documentsId?: string[];
    images: CarrouselImage[];
    status?: string;
    createdDateTime: string;
}

export interface PostOrganizationDto {
    name: string;
    description: string;
    profileFileId?: string;
    bannerFileId?: string;
    documentsId?: string[];
    images: CarrouselImage[];
}

export interface PutOrganizationDto extends Partial<PostOrganizationDto> {

}

export interface ValidateOrganizationDto {
    approved: boolean;
    comment?: string;
}

export interface CarrouselImage {
    imageId: string;
    orderIndex: number;
}