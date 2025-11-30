import { CategoryDto } from "./category";
import { GetOrganizationDto } from "./organization";

export interface PostCampaignDto {
    title: string;
    description: string;
    goalAmount: number;
    endDateTime: Date | string;
    categoryIds: string[];
    tags: string[];
    imageIds: string[];
}

export interface GetCampaignDto {
    id: string;
    ngo: GetOrganizationDto;
    title: string;
    goal_amount?: number;
    current_amount?: number;
    description: string;
    create_date_time?: Date | string;
    end_date_time?: Date | string;
    campaign_state: 'ACTIVE' | 'CLOSED';
    categories: CategoryDto[];
    tags: string[];
    images?: string[];
}

export interface PutCampaignDto {
    title?: string;
    description?: string;
    goalAmount?: number;
    endDateTime?: Date;
    categoryIds?: string[];
    tags?: string[];
    imageIds?: string[];
}

export enum CampaignState {
    ACTIVE,
    CLOSED
}
