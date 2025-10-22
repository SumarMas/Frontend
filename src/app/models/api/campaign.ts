import { CategoryDto } from "./category";
import { GetOrganizationDto } from "./organization";

export interface PostCampaignDto {
    title: string;
    description: string;
    goalAmount: number;
    endDateTime: Date;
    categoryIds: string[];
    tags: string[];
    imageIds: string[];
}

export interface GetCampaignDto {
    id: string;
    ngo: GetOrganizationDto;
    title: string;
    goalAmount: number;
    currentAmount: number;
    description: string;
    endDateTime: Date;
    createDateTime: Date;
    campaignState: CampaignState;
    categories: CategoryDto[];
    tags: string[];
    images?: string[];
}

export interface PutCampaignDto {

}

export enum CampaignState {
    ACTIVE,
    CLOSED
}
